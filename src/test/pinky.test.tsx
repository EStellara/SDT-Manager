// 👻 PINKY - The pink ghost who tests our UI components
// Pinky is ambush-focused and unpredictable, perfect for testing UI edge cases

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

describe("👻 Pinky: UI Component Tests", () => {
	describe("Button Component", () => {
		it("should render button with default styling", () => {
			render(<Button>Pinky Power</Button>);

			const button = screen.getByRole("button", { name: /pinky power/i });
			expect(button).toBeInTheDocument();
			expect(button).toHaveTextContent("Pinky Power");
		});

		it("should handle different button variants", () => {
			const { rerender } = render(<Button variant="default">Default</Button>);
			expect(screen.getByRole("button")).toBeInTheDocument();

			rerender(<Button variant="outline">Outline</Button>);
			expect(screen.getByRole("button")).toHaveTextContent("Outline");

			rerender(<Button variant="ghost">Ghost</Button>);
			expect(screen.getByRole("button")).toHaveTextContent("Ghost");
		});

		it("should handle different button sizes", () => {
			const { rerender } = render(<Button size="sm">Small Pinky</Button>);
			expect(screen.getByRole("button")).toHaveTextContent("Small Pinky");

			rerender(<Button size="lg">Large Pinky</Button>);
			expect(screen.getByRole("button")).toHaveTextContent("Large Pinky");
		});

		it("should handle click events", async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();

			render(<Button onClick={handleClick}>Click Pinky</Button>);

			const button = screen.getByRole("button");
			await user.click(button);

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it("should be disabled when disabled prop is true", () => {
			render(<Button disabled>Disabled Pinky</Button>);

			const button = screen.getByRole("button");
			expect(button).toBeDisabled();
		});
	});

	describe("Input Component", () => {
		it("should render input with placeholder", () => {
			render(<Input placeholder="Enter Pinky's strategy..." />);

			const input = screen.getByPlaceholderText(/enter pinky's strategy/i);
			expect(input).toBeInTheDocument();
		});

		it("should handle user input", async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<Input onChange={handleChange} />);

			const input = screen.getByRole("textbox");
			await user.type(input, "Ambush tactics");

			expect(input).toHaveValue("Ambush tactics");
			expect(handleChange).toHaveBeenCalled();
		});

		it("should handle controlled input", () => {
			const { rerender } = render(<Input value="Pink power" readOnly />);

			const input = screen.getByRole("textbox");
			expect(input).toHaveValue("Pink power");

			rerender(<Input value="Updated pink power" readOnly />);
			expect(input).toHaveValue("Updated pink power");
		});

		it("should handle different input types", () => {
			const { rerender } = render(<Input type="text" />);
			expect(screen.getByRole("textbox")).toBeInTheDocument();

			rerender(<Input type="password" />);
			// Password inputs don't have the textbox role
			expect(screen.getByDisplayValue("")).toBeInTheDocument();

			rerender(<Input type="email" />);
			expect(screen.getByRole("textbox")).toBeInTheDocument();
		});
	});

	describe("Badge Component", () => {
		it("should render badge with text", () => {
			render(<Badge>Pinky Badge</Badge>);

			expect(screen.getByText("Pinky Badge")).toBeInTheDocument();
		});

		it("should handle different badge variants", () => {
			const { rerender } = render(<Badge variant="default">Default</Badge>);
			expect(screen.getByText("Default")).toBeInTheDocument();

			rerender(<Badge variant="secondary">Secondary</Badge>);
			expect(screen.getByText("Secondary")).toBeInTheDocument();

			rerender(<Badge variant="outline">Outline</Badge>);
			expect(screen.getByText("Outline")).toBeInTheDocument();
		});

		it("should handle custom content and icons", () => {
			render(
				<Badge>
					👻 Pinky <span className="ml-1">×</span>
				</Badge>
			);

			expect(screen.getByText(/👻 Pinky/)).toBeInTheDocument();
			expect(screen.getByText("×")).toBeInTheDocument();
		});
	});

	describe("Card Component", () => {
		it("should render card with header and content", () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Pinky's Ambush Plan</CardTitle>
					</CardHeader>
					<CardContent>
						<p>Strategy details go here...</p>
					</CardContent>
				</Card>
			);

			expect(screen.getByText("Pinky's Ambush Plan")).toBeInTheDocument();
			expect(screen.getByText("Strategy details go here...")).toBeInTheDocument();
		});

		it("should handle nested content structure", () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Character Profile</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p>Name: Pinky</p>
							<p>Color: Pink</p>
							<p>Strategy: Ambush</p>
						</div>
					</CardContent>
				</Card>
			);

			expect(screen.getByText("Name: Pinky")).toBeInTheDocument();
			expect(screen.getByText("Color: Pink")).toBeInTheDocument();
			expect(screen.getByText("Strategy: Ambush")).toBeInTheDocument();
		});
	});

	describe("Label Component", () => {
		it("should render label with text", () => {
			render(<Label>Pinky Label</Label>);

			expect(screen.getByText("Pinky Label")).toBeInTheDocument();
		});

		it("should associate with form controls", () => {
			render(
				<div>
					<Label htmlFor="pinky-input">Pinky's Name</Label>
					<Input id="pinky-input" />
				</div>
			);

			const label = screen.getByText("Pinky's Name");
			const input = screen.getByRole("textbox");

			expect(label).toBeInTheDocument();
			expect(input).toHaveAttribute("id", "pinky-input");
		});
	});

	describe("Textarea Component", () => {
		it("should render textarea with placeholder", () => {
			render(<Textarea placeholder="Describe Pinky's ambush strategy..." />);

			const textarea = screen.getByPlaceholderText(/describe pinky's ambush strategy/i);
			expect(textarea).toBeInTheDocument();
		});

		it("should handle multiline text input", async () => {
			const user = userEvent.setup();

			render(<Textarea />);

			const textarea = screen.getByRole("textbox");
			const multilineText = `Line 1: Pinky approaches from behind
Line 2: Uses pink camouflage
Line 3: Strikes at the perfect moment`;

			await user.type(textarea, multilineText);

			expect(textarea).toHaveValue(multilineText);
		});

		it("should handle rows attribute", () => {
			render(<Textarea rows={5} />);

			const textarea = screen.getByRole("textbox");
			expect(textarea).toHaveAttribute("rows", "5");
		});
	});

	describe("Select Component", () => {
		it("should render select with trigger", () => {
			render(
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Choose Pinky's mood" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ambush">Ambush Mode</SelectItem>
						<SelectItem value="playful">Playful</SelectItem>
						<SelectItem value="strategic">Strategic</SelectItem>
					</SelectContent>
				</Select>
			);

			expect(screen.getByText("Choose Pinky's mood")).toBeInTheDocument();
		});

		it("should handle controlled selection", () => {
			render(
				<Select value="ambush">
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ambush">Ambush Mode</SelectItem>
						<SelectItem value="playful">Playful</SelectItem>
					</SelectContent>
				</Select>
			);

			// The selected value should be reflected in the component
			expect(screen.getByRole("combobox")).toBeInTheDocument();
		});
	});

	describe("Accessibility Features", () => {
		it("should provide proper ARIA labels and roles", () => {
			render(
				<div>
					<Button aria-label="Pinky action button">👻</Button>
					<Input aria-label="Pinky input field" />
					<Label>Accessible Label</Label>
				</div>
			);

			expect(screen.getByLabelText("Pinky action button")).toBeInTheDocument();
			expect(screen.getByLabelText("Pinky input field")).toBeInTheDocument();
			expect(screen.getByText("Accessible Label")).toBeInTheDocument();
		});

		it("should handle keyboard navigation", async () => {
			const user = userEvent.setup();

			render(
				<div>
					<Button>First</Button>
					<Button>Second</Button>
					<Input />
				</div>
			);

			// Tab through elements
			await user.tab();
			expect(screen.getByRole("button", { name: "First" })).toHaveFocus();

			await user.tab();
			expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();

			await user.tab();
			expect(screen.getByRole("textbox")).toHaveFocus();
		});
	});

	describe("Responsive Behavior", () => {
		it("should handle different screen sizes gracefully", () => {
			// Mock different viewport sizes
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 320, // Mobile width
			});

			render(
				<Card className="w-full">
					<CardContent>
						<p>Pinky adapts to small screens</p>
					</CardContent>
				</Card>
			);

			expect(screen.getByText("Pinky adapts to small screens")).toBeInTheDocument();

			// Test larger screen
			Object.defineProperty(window, "innerWidth", {
				value: 1024, // Desktop width
			});

			// Component should still render properly
			expect(screen.getByText("Pinky adapts to small screens")).toBeInTheDocument();
		});
	});

	describe("Error States and Edge Cases", () => {
		it("should handle empty or null content gracefully", () => {
			render(
				<div>
					<Button>{null}</Button>
					<Badge>{""}</Badge>
					<Input value="" />
				</div>
			);

			// Components should still render without crashing
			expect(screen.getByRole("button")).toBeInTheDocument();
			expect(screen.getByRole("textbox")).toBeInTheDocument();
		});

		it("should handle long text content", () => {
			const longText =
				"P".repeat(1000) + "inky's very long strategy description that should handle overflow gracefully";

			render(
				<div>
					<Button>{longText}</Button>
					<Badge>{longText}</Badge>
					<Textarea value={longText} readOnly />
				</div>
			);

			// Components should render without breaking layout
			expect(screen.getByRole("button")).toBeInTheDocument();
			expect(screen.getByRole("textbox")).toHaveValue(longText);
		});
	});
});
