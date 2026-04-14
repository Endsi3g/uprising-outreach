import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No leads yet" />);
    expect(screen.getByText("No leads yet")).toBeDefined();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="Empty" description="Import your first list." />);
    expect(screen.getByText("Import your first list.")).toBeDefined();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText("Import your first list.")).toBeNull();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Import leads</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Import leads" })).toBeDefined();
  });

  it("does not render action slot when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("always renders the decorative icon glyph", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByText("◈")).toBeDefined();
  });
});
