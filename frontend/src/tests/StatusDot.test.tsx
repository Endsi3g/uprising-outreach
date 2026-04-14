import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusDot } from "@/components/ui/StatusDot";

const STATUSES = ["active", "pending", "error", "paused", "disconnected"] as const;

describe("StatusDot", () => {
  it.each(STATUSES)("renders status=%s without crashing", (status) => {
    render(<StatusDot status={status} />);
    // The dot span is always present
    const container = document.querySelector("span.inline-flex");
    expect(container).toBeDefined();
  });

  it("renders label when provided", () => {
    render(<StatusDot status="active" label="Connected" />);
    expect(screen.getByText("Connected")).toBeDefined();
  });

  it("does not render label element when label not provided", () => {
    render(<StatusDot status="active" />);
    // No text node should appear
    expect(document.querySelectorAll("span.inline-flex span").length).toBe(1);
  });

  it("active status uses green color", () => {
    render(<StatusDot status="active" />);
    const dot = document.querySelector("span.inline-block") as HTMLElement;
    // jsdom normalises hex to rgb()
    expect(dot.style.background).toBe("rgb(22, 163, 74)");
  });

  it("error status uses red color", () => {
    render(<StatusDot status="error" />);
    const dot = document.querySelector("span.inline-block") as HTMLElement;
    expect(dot.style.background).toBe("rgb(220, 38, 38)");
  });

  it("pending status uses amber color", () => {
    render(<StatusDot status="pending" />);
    const dot = document.querySelector("span.inline-block") as HTMLElement;
    expect(dot.style.background).toBe("rgb(202, 138, 4)");
  });
});
