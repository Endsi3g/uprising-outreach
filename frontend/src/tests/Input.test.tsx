import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Input, Textarea } from "@/components/ui/Input";

describe("Input", () => {
  it("renders without label", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeDefined();
  });

  it("renders label and links it to input via htmlFor", () => {
    render(<Input label="Email" />);
    const label = screen.getByText("Email");
    const input = screen.getByLabelText("Email");
    expect(label).toBeDefined();
    expect(input).toBeDefined();
  });

  it("auto-generates id from label when id not provided", () => {
    render(<Input label="First Name" />);
    const input = screen.getByLabelText("First Name") as HTMLInputElement;
    expect(input.id).toBe("first-name");
  });

  it("uses provided id over auto-generated", () => {
    render(<Input label="Email" id="custom-id" />);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    expect(input.id).toBe("custom-id");
  });

  it("shows error message when error prop given", () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeDefined();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    await user.type(input, "John");
    expect(input.value).toBe("John");
  });

  it("is disabled when disabled prop set", () => {
    render(<Input label="Field" disabled />);
    const input = screen.getByLabelText("Field") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});

describe("Textarea", () => {
  it("renders without label", () => {
    render(<Textarea placeholder="Write something" />);
    expect(screen.getByPlaceholderText("Write something")).toBeDefined();
  });

  it("renders label and links it to textarea", () => {
    render(<Textarea label="Message" />);
    expect(screen.getByLabelText("Message")).toBeDefined();
  });

  it("shows error message when error prop given", () => {
    render(<Textarea label="Notes" error="Field required" />);
    expect(screen.getByText("Field required")).toBeDefined();
  });

  it("accepts multi-line input", async () => {
    const user = userEvent.setup();
    render(<Textarea label="Notes" />);
    const textarea = screen.getByLabelText("Notes") as HTMLTextAreaElement;
    await user.type(textarea, "Line 1{Enter}Line 2");
    expect(textarea.value).toContain("Line 1");
    expect(textarea.value).toContain("Line 2");
  });
});
