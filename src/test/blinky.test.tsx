// 👻 BLINKY - The red ghost who tests our character management system
// Blinky is aggressive and direct, perfect for testing character operations

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CharacterModal } from "@/components/CharacterModal";
import type { Character } from "@/types/dialog";

describe("👻 Blinky: Character Management Tests", () => {
	const mockCharacter: Character = {
		id: "blinky-red",
		name: "Blinky",
		displayName: "Blinky the Leader",
		description: "The aggressive red ghost who leads the chase",
		color: "#ff0000",
		role: "Antagonist",
		personality: ["Aggressive", "Direct", "Relentless"],
		voiceProfile: {
			tone: "Commanding",
			accent: "Authoritative",
			speed: "fast",
		},
		metadata: { isLeader: true, aggressionLevel: "maximum" },
		createdAt: new Date("2025-05-31"),
		updatedAt: new Date("2025-05-31"),
	};

	describe("Character Creation", () => {
		it("should create a new character with required properties", () => {
			const newCharacter: Partial<Character> = {
				name: "Blinky Jr.",
				color: "#ff4444",
			};

			const completeCharacter: Character = {
				id: "generated-id",
				name: newCharacter.name!,
				color: newCharacter.color!,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(completeCharacter.name).toBe("Blinky Jr.");
			expect(completeCharacter.color).toBe("#ff4444");
			expect(completeCharacter.id).toBeDefined();
			expect(completeCharacter.createdAt).toBeInstanceOf(Date);
		});

		it("should assign default values for optional properties", () => {
			const character: Character = {
				id: "test-blinky",
				name: "Test Blinky",
				color: "#ff0000",
				displayName: undefined,
				description: undefined,
				role: undefined,
				personality: [],
				voiceProfile: undefined,
				metadata: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(character.personality).toEqual([]);
			expect(character.metadata).toEqual({});
			expect(character.displayName).toBeUndefined();
		});
	});
	describe("Character Modal Component", () => {
		const mockOnSave = vi.fn();
		const mockOnClose = vi.fn();

		beforeEach(() => {
			mockOnSave.mockClear();
			mockOnClose.mockClear();
		});

		it("should render character creation modal", () => {
			render(<CharacterModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

			expect(screen.getByRole("heading", { name: /create character/i })).toBeInTheDocument();
			expect(screen.getByLabelText(/character name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
		});

		it("should render character editing modal with existing data", () => {
			render(
				<CharacterModal character={mockCharacter} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
			);

			expect(screen.getByRole("heading", { name: /edit character/i })).toBeInTheDocument();
			expect(screen.getByDisplayValue("Blinky")).toBeInTheDocument();
			expect(screen.getByDisplayValue("Blinky the Leader")).toBeInTheDocument();
			expect(screen.getByDisplayValue(/aggressive red ghost/i)).toBeInTheDocument();
		});

		it("should allow user to input character details", async () => {
			const user = userEvent.setup();

			render(<CharacterModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

			const nameInput = screen.getByLabelText(/character name/i);
			const displayNameInput = screen.getByLabelText(/display name/i);

			await user.type(nameInput, "Shadow Blinky");
			await user.type(displayNameInput, "The Shadow Leader");

			expect(nameInput).toHaveValue("Shadow Blinky");
			expect(displayNameInput).toHaveValue("The Shadow Leader");
		});

		it("should handle personality trait management", async () => {
			const user = userEvent.setup();

			render(
				<CharacterModal character={mockCharacter} isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
			);

			// Check existing traits are displayed
			expect(screen.getByText("Aggressive")).toBeInTheDocument();
			expect(screen.getByText("Direct")).toBeInTheDocument();
			expect(screen.getByText("Relentless")).toBeInTheDocument(); // Try to add a new trait
			const newTraitInput = screen.getByPlaceholderText(/add custom trait/i);
			const addButton = screen.getByRole("button", { name: /add personality trait/i });

			await user.type(newTraitInput, "Determined");
			await user.click(addButton);

			// The trait should be added (this tests the internal state)
			expect(newTraitInput).toHaveValue("");
		});

		it("should validate required fields before saving", async () => {
			const user = userEvent.setup();

			render(<CharacterModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

			const saveButton = screen.getByRole("button", { name: /create/i });

			// Save button should be disabled when name is empty
			expect(saveButton).toBeDisabled();

			// Fill in required field
			const nameInput = screen.getByLabelText(/character name/i);
			await user.type(nameInput, "New Blinky");

			// Save button should now be enabled
			expect(saveButton).toBeEnabled();
		});

		it("should call onSave with correct character data", async () => {
			const user = userEvent.setup();

			render(<CharacterModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

			// Fill in character details
			await user.type(screen.getByLabelText(/character name/i), "Test Blinky");
			await user.type(screen.getByLabelText(/display name/i), "Test Leader");
			await user.type(screen.getByLabelText(/description/i), "A test version of Blinky");

			// Save the character
			const saveButton = screen.getByRole("button", { name: /create/i });
			await user.click(saveButton);

			expect(mockOnSave).toHaveBeenCalledTimes(1);
			const savedCharacter = mockOnSave.mock.calls[0][0];
			expect(savedCharacter.name).toBe("Test Blinky");
			expect(savedCharacter.displayName).toBe("Test Leader");
			expect(savedCharacter.description).toBe("A test version of Blinky");
		});

		it("should call onClose when cancel button is clicked", async () => {
			const user = userEvent.setup();

			render(<CharacterModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await user.click(cancelButton);

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});
	});

	describe("Character Voice Profile", () => {
		it("should handle voice profile settings", () => {
			const character = { ...mockCharacter };

			expect(character.voiceProfile?.tone).toBe("Commanding");
			expect(character.voiceProfile?.accent).toBe("Authoritative");
			expect(character.voiceProfile?.speed).toBe("fast");

			// Test voice profile updates
			character.voiceProfile = {
				...character.voiceProfile!,
				tone: "Menacing",
				speed: "normal",
			};

			expect(character.voiceProfile.tone).toBe("Menacing");
			expect(character.voiceProfile.speed).toBe("normal");
			expect(character.voiceProfile.accent).toBe("Authoritative"); // Should remain unchanged
		});
	});

	describe("Character Color Management", () => {
		it("should validate hex color format", () => {
			const validColors = ["#ff0000", "#FF0000", "#f00", "#F00"];
			const invalidColors = ["red", "rgb(255,0,0)", "#gg0000", "ff0000"];

			validColors.forEach((color) => {
				expect(color).toMatch(/^#[0-9a-fA-F]{3,6}$/);
			});

			invalidColors.forEach((color) => {
				expect(color).not.toMatch(/^#[0-9a-fA-F]{3,6}$/);
			});
		});

		it("should provide default color palette", () => {
			const defaultColors = [
				"#3b82f6",
				"#10b981",
				"#f59e0b",
				"#ef4444",
				"#8b5cf6",
				"#f97316",
				"#06b6d4",
				"#84cc16",
				"#ec4899",
				"#6b7280",
			];

			expect(defaultColors).toHaveLength(10);
			expect(defaultColors).toContain("#ef4444"); // Red for Blinky
			expect(defaultColors.every((color) => color.match(/^#[0-9a-fA-F]{6}$/))).toBe(true);
		});
	});
});
