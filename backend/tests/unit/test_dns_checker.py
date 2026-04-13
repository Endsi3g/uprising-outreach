"""Unit tests for DNS checker — mocks dnspython."""

from unittest.mock import MagicMock, patch

from app.senders.dns_checker import check_domain


def make_txt_answer(text: str):
    mock = MagicMock()
    mock.to_text.return_value = f'"{text}"'
    return mock


def mock_resolve(name: str, record_type: str, **kwargs):
    name_str = str(name)
    if record_type != "TXT":
        raise Exception("Unexpected record type")

    # SPF
    if name_str == "example.com":
        return [make_txt_answer("v=spf1 include:_spf.google.com ~all")]

    # DKIM
    if "google._domainkey.example.com" in name_str:
        return [make_txt_answer("v=DKIM1; k=rsa; p=MIIBIjANBg...")]

    # DMARC
    if name_str == "_dmarc.example.com":
        return [make_txt_answer("v=DMARC1; p=reject; rua=mailto:dmarc@example.com")]

    import dns.exception
    raise dns.exception.DNSException("NXDOMAIN")


@patch("dns.resolver.resolve", side_effect=mock_resolve)
def test_all_valid(mock_dns):
    result = check_domain("user@example.com")
    assert result.spf_valid is True
    assert result.dkim_valid is True
    assert result.dmarc_valid is True
    assert result.dmarc_policy == "reject"
    assert result.all_valid is True


@patch("dns.resolver.resolve", side_effect=lambda *a, **kw: (_ for _ in ()).throw(
    __import__("dns.exception", fromlist=["DNSException"]).DNSException("NXDOMAIN")
))
def test_no_records(mock_dns):
    result = check_domain("user@nodns.com")
    assert result.spf_valid is False
    assert result.dkim_valid is False
    assert result.dmarc_valid is False
    assert result.all_valid is False
    assert result.spf_error is not None


def mock_resolve_spf_only(name: str, record_type: str, **kwargs):
    name_str = str(name)
    if name_str == "spfonly.com" and record_type == "TXT":
        return [make_txt_answer("v=spf1 -all")]
    import dns.exception
    raise dns.exception.DNSException("NXDOMAIN")


@patch("dns.resolver.resolve", side_effect=mock_resolve_spf_only)
def test_spf_only(mock_dns):
    result = check_domain("user@spfonly.com")
    assert result.spf_valid is True
    assert result.dkim_valid is False
    assert result.dmarc_valid is False
    assert result.all_valid is False
