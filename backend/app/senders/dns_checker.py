"""
DNS deliverability checker — verifies SPF, DKIM, and DMARC records
for a given email domain using dnspython.
"""

import logging
import re
from dataclasses import dataclass, field

import dns.exception
import dns.resolver

logger = logging.getLogger(__name__)


@dataclass
class DNSCheckResult:
    domain: str
    spf_valid: bool = False
    spf_record: str | None = None
    spf_error: str | None = None

    dkim_valid: bool = False
    dkim_selector: str | None = None
    dkim_record: str | None = None
    dkim_error: str | None = None

    dmarc_valid: bool = False
    dmarc_policy: str | None = None
    dmarc_record: str | None = None
    dmarc_error: str | None = None

    @property
    def all_valid(self) -> bool:
        return self.spf_valid and self.dkim_valid and self.dmarc_valid

    def to_dict(self) -> dict:
        return {
            "domain": self.domain,
            "spf": {
                "valid": self.spf_valid,
                "record": self.spf_record,
                "error": self.spf_error,
            },
            "dkim": {
                "valid": self.dkim_valid,
                "selector": self.dkim_selector,
                "record": self.dkim_record,
                "error": self.dkim_error,
            },
            "dmarc": {
                "valid": self.dmarc_valid,
                "policy": self.dmarc_policy,
                "record": self.dmarc_record,
                "error": self.dmarc_error,
            },
            "all_valid": self.all_valid,
        }


COMMON_DKIM_SELECTORS = [
    "google", "mail", "default", "selector1", "selector2",
    "dkim", "k1", "s1", "s2", "mxvault", "smtp",
]


def _query_txt(name: str) -> list[str]:
    try:
        answers = dns.resolver.resolve(name, "TXT", lifetime=5.0)
        return [rdata.to_text().strip('"') for rdata in answers]
    except (dns.exception.DNSException, Exception):
        return []


def check_spf(domain: str, result: DNSCheckResult) -> None:
    records = _query_txt(domain)
    spf_records = [r for r in records if r.startswith("v=spf1")]

    if not spf_records:
        result.spf_error = "No SPF record found"
        return

    if len(spf_records) > 1:
        result.spf_error = "Multiple SPF records found (RFC violation)"
        return

    result.spf_record = spf_records[0]
    result.spf_valid = True


def check_dkim(domain: str, result: DNSCheckResult, selector: str | None = None) -> None:
    selectors_to_try = [selector] if selector else COMMON_DKIM_SELECTORS

    for sel in selectors_to_try:
        dkim_host = f"{sel}._domainkey.{domain}"
        records = _query_txt(dkim_host)
        dkim_records = [r for r in records if "v=DKIM1" in r or "p=" in r]

        if dkim_records:
            result.dkim_valid = True
            result.dkim_selector = sel
            result.dkim_record = dkim_records[0][:200]  # truncate for storage
            return

    result.dkim_error = f"No DKIM record found (tried selectors: {', '.join(selectors_to_try[:5])}...)"


def check_dmarc(domain: str, result: DNSCheckResult) -> None:
    dmarc_host = f"_dmarc.{domain}"
    records = _query_txt(dmarc_host)
    dmarc_records = [r for r in records if r.startswith("v=DMARC1")]

    if not dmarc_records:
        result.dmarc_error = "No DMARC record found"
        return

    record = dmarc_records[0]
    result.dmarc_record = record

    # Parse policy
    policy_match = re.search(r"p=(\w+)", record)
    if policy_match:
        policy = policy_match.group(1).lower()
        result.dmarc_policy = policy
        result.dmarc_valid = True
    else:
        result.dmarc_error = "DMARC record found but no policy (p=) tag"


def check_domain(email: str, dkim_selector: str | None = None) -> DNSCheckResult:
    """Run SPF, DKIM, and DMARC checks for the domain of the given email address."""
    domain = email.split("@")[-1].lower()
    result = DNSCheckResult(domain=domain)

    try:
        check_spf(domain, result)
    except Exception as e:
        result.spf_error = f"SPF check error: {e}"
        logger.warning("SPF check failed for %s: %s", domain, e)

    try:
        check_dkim(domain, result, dkim_selector)
    except Exception as e:
        result.dkim_error = f"DKIM check error: {e}"
        logger.warning("DKIM check failed for %s: %s", domain, e)

    try:
        check_dmarc(domain, result)
    except Exception as e:
        result.dmarc_error = f"DMARC check error: {e}"
        logger.warning("DMARC check failed for %s: %s", domain, e)

    return result
