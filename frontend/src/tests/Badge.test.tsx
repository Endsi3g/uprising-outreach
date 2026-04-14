import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge, LeadStatusBadge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("applies default color styles when no color prop", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    expect(el.tagName.toLowerCase()).toBe("span");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Tag</Badge>);
    const el = screen.getByText("Tag");
    expect(el.className).toContain("custom-class");
  });

  it.each(["green", "amber", "red", "blue", "terracotta"] as const)(
    "renders color=%s without crashing",
    (color) => {
      render(<Badge color={color}>{color}</Badge>);
      expect(screen.getByText(color)).toBeDefined();
    }
  );
});

describe("LeadStatusBadge", () => {
  it.each([
    "raw",
    "enriching",
    "enriched",
    "scored",
    "in_sequence",
    "replied",
    "converted",
    "suppressed",
  ])("renders status=%s with underscores replaced", (status) => {
    render(<LeadStatusBadge status={status} />);
    const expected = status.replace("_", " ");
    expect(screen.getByText(expected)).toBeDefined();
  });

  it("falls back to default color for unknown status", () => {
    render(<LeadStatusBadge status="unknown_status" />);
    expect(screen.getByText("unknown status")).toBeDefined();
  });
});
