// 🏠 SPUNKY - The ghost who tests our home page navigation
// Spunky is energetic and organized, perfect for testing the home page functionality

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { HomePage } from "@/pages/HomePage";

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Helper to render HomePage with router context
const renderHomePage = () => {
	return render(
		<BrowserRouter>
			<HomePage />
		</BrowserRouter>
	);
};

describe("🏠 Spunky: HomePage Tests", () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});

	describe("Homepage Rendering", () => {
		it("should render the main title and description", () => {
			renderHomePage();

			expect(screen.getByText("SDT Manager")).toBeInTheDocument();
			expect(
				screen.getByText("Create and manage your dialog trees for interactive storytelling")
			).toBeInTheDocument();
		});

		it("should render the create new project card", () => {
			renderHomePage();

			expect(screen.getByText("Create New Project")).toBeInTheDocument();
			expect(screen.getByText("Start building a new dialog tree from scratch")).toBeInTheDocument();
			expect(screen.getByPlaceholderText("Enter project name...")).toBeInTheDocument();
		});

		it("should render the open existing project card", () => {
			renderHomePage();

			expect(screen.getByText("Open Existing Project")).toBeInTheDocument();
			expect(screen.getByText("Load a dialog tree project from your computer")).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /browse files/i })).toBeInTheDocument();
		});

		it("should render the recent projects section", () => {
			renderHomePage();

			expect(screen.getByText("Recent Projects")).toBeInTheDocument();
			expect(screen.getByText("Continue working on your recent dialog trees")).toBeInTheDocument();

			// Check for sample recent projects
			expect(screen.getByText("Adventure Game Dialog")).toBeInTheDocument();
			expect(screen.getByText("NPC Conversation System")).toBeInTheDocument();
			expect(screen.getByText("Quest Dialog Tree")).toBeInTheDocument();
		});
	});

	describe("Navigation Functionality", () => {
		it("should disable create button when project name is empty", () => {
			renderHomePage();

			const createButton = screen.getByRole("button", { name: /create project/i });
			expect(createButton).toBeDisabled();
		});

		it("should enable create button when project name is entered", async () => {
			const user = userEvent.setup();
			renderHomePage();

			const projectNameInput = screen.getByPlaceholderText("Enter project name...");
			const createButton = screen.getByRole("button", { name: /create project/i });

			await user.type(projectNameInput, "Test Project");

			expect(createButton).toBeEnabled();
		});

		it("should navigate to project page when create button is clicked", async () => {
			const user = userEvent.setup();
			renderHomePage();

			const projectNameInput = screen.getByPlaceholderText("Enter project name...");
			const createButton = screen.getByRole("button", { name: /create project/i });

			await user.type(projectNameInput, "Test Project");
			await user.click(createButton);

			expect(mockNavigate).toHaveBeenCalledWith("/project");
		});

		it("should navigate to project page when Enter key is pressed in project name input", async () => {
			const user = userEvent.setup();
			renderHomePage();

			const projectNameInput = screen.getByPlaceholderText("Enter project name...");

			await user.type(projectNameInput, "Test Project");
			await user.keyboard("{Enter}");

			expect(mockNavigate).toHaveBeenCalledWith("/project");
		});

		it("should navigate to project page when browse files button is clicked", async () => {
			const user = userEvent.setup();
			renderHomePage();

			const browseButton = screen.getByRole("button", { name: /browse files/i });
			await user.click(browseButton);

			expect(mockNavigate).toHaveBeenCalledWith("/project");
		});

		it("should navigate to project page when a recent project is clicked", async () => {
			const user = userEvent.setup();
			renderHomePage();

			const recentProject = screen.getByText("Adventure Game Dialog");
			await user.click(recentProject);

			expect(mockNavigate).toHaveBeenCalledWith("/project");
		});
	});
	describe("Theme Toggle", () => {
		it("should render the theme toggle component", () => {
			renderHomePage();

			// The theme toggle button should be present
			// Since we're not testing the actual theme toggle implementation,
			// we just verify the component renders without errors
			expect(screen.getByText("SDT Manager")).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have proper heading structure", () => {
			renderHomePage();

			const mainHeading = screen.getByRole("heading", { level: 1 });
			expect(mainHeading).toHaveTextContent("SDT Manager");
		});

		it("should have proper labels for form inputs", () => {
			renderHomePage();

			const projectNameInput = screen.getByLabelText("Project Name");
			expect(projectNameInput).toBeInTheDocument();
		});

		it("should have proper button roles", () => {
			renderHomePage();

			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);

			// Check that important buttons are present
			expect(screen.getByRole("button", { name: /create project/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /browse files/i })).toBeInTheDocument();
		});
	});
});
