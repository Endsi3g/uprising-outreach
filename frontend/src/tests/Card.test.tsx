import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "@/components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeDefined();
  });

  it("applies default padding (md = p-6)", () => {
    render(<Card>Content</Card>);
    const el = screen.getByText("Content");
    expect(el.className).toContain("p-6");
  });

  it("applies padding=none (no padding class)", () => {
    render(<Card padding="none">Content</Card>);
    const el = screen.getByText("Content");
    expect(el.className).not.toContain("p-4");
    expect(el.className).not.toContain("p-6");
    expect(el.className).not.toContain("p-8");
  });

  it("applies padding=sm", () => {
    render(<Card padding="sm">Content</Card>);
    expect(screen.getByText("Content").className).toContain("p-4");
  });

  it("applies padding=lg", () => {
    render(<Card padding="lg">Content</Card>);
    expect(screen.getByText("Content").className).toContain("p-8");
  });

  it("merges custom className", () => {
    render(<Card className="extra-class">Content</Card>);
    expect(screen.getByText("Content").className).toContain("extra-class");
  });

  it("applies custom style", () => {
    render(<Card style={{ opacity: 0.5 }}>Content</Card>);
    const el = screen.getByText("Content") as HTMLElement;
    expect(el.style.opacity).toBe("0.5");
  });
});
