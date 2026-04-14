import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageHeader } from "@/components/ui/PageHeader";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Leads" />);
    expect(screen.getByRole("heading", { level: 1, name: "Leads" })).toBeDefined();
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Leads" description="Manage your prospects" />);
    expect(screen.getByText("Manage your prospects")).toBeDefined();
  });

  it("does not render description when not provided", () => {
    render(<PageHeader title="Leads" />);
    expect(screen.queryByText("Manage your prospects")).toBeNull();
  });

  it("renders count when provided", () => {
    render(<PageHeader title="Leads" count={1234} />);
    // toLocaleString formats vary by locale (1,234 / 1.234 / 1 234)
    expect(screen.getByText(/1.?234/)).toBeDefined();
  });

  it("does not render count element when count not provided", () => {
    render(<PageHeader title="Leads" />);
    // Only the title h1 should be in the baseline div
    expect(screen.queryByText(/^\d+$/)).toBeNull();
  });

  it("renders count=0 explicitly", () => {
    render(<PageHeader title="Leads" count={0} />);
    expect(screen.getByText("0")).toBeDefined();
  });

  it("renders actions when provided", () => {
    render(<PageHeader title="Leads" actions={<button>New Lead</button>} />);
    expect(screen.getByRole("button", { name: "New Lead" })).toBeDefined();
  });

  it("does not render actions container when not provided", () => {
    render(<PageHeader title="Leads" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
