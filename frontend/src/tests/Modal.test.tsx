import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "@/components/ui/Modal";

function renderModal(overrides?: Partial<Parameters<typeof Modal>[0]>) {
  const onClose = vi.fn();
  render(
    <Modal open={true} onClose={onClose} title="Test Modal" {...overrides}>
      <p>Modal body</p>
    </Modal>
  );
  return { onClose };
}

describe("Modal", () => {
  it("renders title and children when open=true", () => {
    renderModal();
    expect(screen.getByText("Test Modal")).toBeDefined();
    expect(screen.getByText("Modal body")).toBeDefined();
  });

  it("renders nothing when open=false", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Hidden Modal">
        <p>Should not appear</p>
      </Modal>
    );
    expect(screen.queryByText("Hidden Modal")).toBeNull();
    expect(screen.queryByText("Should not appear")).toBeNull();
  });

  it("calls onClose when close button clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on Escape key", () => {
    const { onClose } = renderModal();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders footer when provided", () => {
    renderModal({ footer: <button>Confirm</button> });
    expect(screen.getByText("Confirm")).toBeDefined();
  });

  it("does not render footer section when footer not provided", () => {
    renderModal();
    expect(screen.queryByText("Confirm")).toBeNull();
  });

  it("applies size=sm class", () => {
    renderModal({ size: "sm" });
    // The inner dialog div has max-w-sm
    const dialog = screen.getByText("Test Modal").closest(".max-w-sm");
    expect(dialog).toBeDefined();
  });

  it("applies size=lg class", () => {
    renderModal({ size: "lg" });
    const dialog = screen.getByText("Test Modal").closest(".max-w-2xl");
    expect(dialog).toBeDefined();
  });

  it("does not call onClose when clicking inside the modal body", () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByText("Modal body"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
