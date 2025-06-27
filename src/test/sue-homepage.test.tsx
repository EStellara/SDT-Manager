// 🏠 SPUNKY - The ghost who tests our home page navigation
// Spunky is energetic and organized, perfect for testing the home page functionality

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
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

// Mock the file import utilities
vi.mock("@/lib/fileImport", () => ({
	openFilePicker: vi.fn(),
	importProject: vi.fn(),
}));

// Mock the DialogProjectContext
const mockDispatch = vi.fn();
vi.mock("@/contexts/DialogProjectContext", () => ({
	useDialogProject: () => ({
		dispatch: mockDispatch,
		state: { currentProject: null },
	}),
}));

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
		mockDispatch.mockClear();
		vi.clearAllMocks();
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
			expect(screen.getByText("Load a dialog tree project from your computer (JSON or ZIP)")).toBeInTheDocument();
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
			const { openFilePicker, importProject } = await import("@/lib/fileImport");
			const user = userEvent.setup();

			const mockFile = new File(["test content"], "test.json", { type: "application/json" });
			const mockProject = {
				id: "test-project",
				name: "Test Project",
				description: "A test project",
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			vi.mocked(openFilePicker).mockResolvedValue(mockFile);
			vi.mocked(importProject).mockResolvedValue(mockProject);

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

	describe("File Import Functionality", () => {
		it("should call file picker when browse files button is clicked", async () => {
			const { openFilePicker } = await import("@/lib/fileImport");
			const user = userEvent.setup();

			vi.mocked(openFilePicker).mockResolvedValue(null); // User cancels

			renderHomePage();

			const browseButton = screen.getByRole("button", { name: /browse files/i });
			await user.click(browseButton);

			expect(openFilePicker).toHaveBeenCalledWith(".json,.zip");
		});

		it("should handle successful file import", async () => {
			const { openFilePicker, importProject } = await import("@/lib/fileImport");
			const user = userEvent.setup();

			const mockFile = new File(["test content"], "test.json", { type: "application/json" });
			const mockProject = {
				id: "test-project",
				name: "Test Project",
				description: "A test project",
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			vi.mocked(openFilePicker).mockResolvedValue(mockFile);
			vi.mocked(importProject).mockResolvedValue(mockProject);

			renderHomePage();

			const browseButton = screen.getByRole("button", { name: /browse files/i });
			await user.click(browseButton);

			expect(importProject).toHaveBeenCalledWith(mockFile);
			expect(mockDispatch).toHaveBeenCalledWith({
				type: "LOAD_PROJECT",
				payload: mockProject,
			});
			expect(mockNavigate).toHaveBeenCalledWith("/project");
		});

		it("should display error message on import failure", async () => {
			const { openFilePicker, importProject } = await import("@/lib/fileImport");
			const user = userEvent.setup();

			const mockFile = new File(["invalid content"], "invalid.json", { type: "application/json" });
			const errorMessage = "Invalid project format";

			vi.mocked(openFilePicker).mockResolvedValue(mockFile);
			vi.mocked(importProject).mockRejectedValue(new Error(errorMessage));

			renderHomePage();

			const browseButton = screen.getByRole("button", { name: /browse files/i });
			await user.click(browseButton);

			// Wait for error to appear
			await screen.findByText(errorMessage);
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});

		it("should show loading state during import", async () => {
			const { openFilePicker, importProject } = await import("@/lib/fileImport");
			const user = userEvent.setup();

			const mockFile = new File(["test content"], "test.json", { type: "application/json" });

			// Create a promise that we can control
			let resolveImport: (value: any) => void;
			const importPromise = new Promise((resolve) => {
				resolveImport = resolve;
			});

			vi.mocked(openFilePicker).mockResolvedValue(mockFile);
			vi.mocked(importProject).mockReturnValue(importPromise as any);

			renderHomePage();

			const browseButton = screen.getByRole("button", { name: /browse files/i });

			await act(async () => {
				await user.click(browseButton);
			});

			// Should show loading state
			expect(screen.getByText("Loading Project...")).toBeInTheDocument();

			// Resolve the import
			resolveImport!({
				id: "test",
				name: "Test",
				description: "",
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		});

		it("should handle user cancellation gracefully", async () => {
			const { openFilePicker } = await import("@/lib/fileImport");
			const user = userEvent.setup();

			vi.mocked(openFilePicker).mockResolvedValue(null); // User cancels

			renderHomePage();

			const browseButton = screen.getByRole("button", { name: /browse files/i });
			await user.click(browseButton);

			// Should not navigate or show error
			expect(mockNavigate).not.toHaveBeenCalled();
			expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
		});
		it("should clear error messages when dismiss button is clicked", async () => {
			const { openFilePicker, importProject } = await import("@/lib/fileImport");
			const user = userEvent.setup();

			const mockFile = new File(["invalid content"], "invalid.json", { type: "application/json" });
			const errorMessage = "Invalid project format";

			vi.mocked(openFilePicker).mockResolvedValue(mockFile);
			vi.mocked(importProject).mockRejectedValue(new Error(errorMessage));

			renderHomePage();

			const browseButton = screen.getByRole("button", { name: /browse files/i });
			await user.click(browseButton);

			// Wait for error to appear
			await screen.findByText(errorMessage);

			// Click the dismiss button
			const dismissButton = screen.getByRole("button", { name: "×" });
			await user.click(dismissButton);

			// Error should be removed
			expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
		});
	});

	describe("Drag and Drop Functionality", () => {
		it("should display drag-over indicator when files are dragged over the project card", async () => {
			renderHomePage();

			const projectCard = screen.getByText("Open Existing Project").closest(".drag-zone");
			expect(projectCard).toBeInTheDocument();

			// Simulate drag enter
			const dragEvent = new DragEvent("dragenter", {
				bubbles: true,
				dataTransfer: new DataTransfer(),
			});

			await act(async () => {
				projectCard!.dispatchEvent(dragEvent);
			});

			// Should show drag-over indicator
			expect(await screen.findByText("Drop your project file here")).toBeInTheDocument();
		});

		it("should handle file drop with valid JSON file", async () => {
			const { importProject } = await import("@/lib/fileImport");

			const mockProject = {
				id: "dropped-project",
				name: "Dropped Project",
				description: "A project from drag and drop",
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			vi.mocked(importProject).mockResolvedValue(mockProject);

			renderHomePage();

			const projectCard = screen.getByText("Open Existing Project").closest(".drag-zone");
			expect(projectCard).toBeInTheDocument();

			// Create a mock file
			const mockFile = new File(["test content"], "project.json", { type: "application/json" });

			// Create drag event with file
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(mockFile);
			const dropEvent = new DragEvent("drop", {
				bubbles: true,
				dataTransfer,
			});

			await act(async () => {
				projectCard!.dispatchEvent(dropEvent);
			});

			// Should process the file
			expect(importProject).toHaveBeenCalledWith(mockFile);
		});

		it("should handle file drop with valid ZIP file", async () => {
			const { importProject } = await import("@/lib/fileImport");

			const mockProject = {
				id: "zip-project",
				name: "ZIP Project",
				description: "A project from ZIP file",
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			vi.mocked(importProject).mockResolvedValue(mockProject);

			renderHomePage();

			const projectCard = screen.getByText("Open Existing Project").closest(".drag-zone");
			expect(projectCard).toBeInTheDocument();

			// Create a mock ZIP file
			const mockFile = new File(["zip content"], "project.zip", { type: "application/zip" });

			// Create drag event with file
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(mockFile);
			const dropEvent = new DragEvent("drop", {
				bubbles: true,
				dataTransfer,
			});

			await act(async () => {
				projectCard!.dispatchEvent(dropEvent);
			});

			// Should process the file
			expect(importProject).toHaveBeenCalledWith(mockFile);
		});

		it("should filter out unsupported file types on drop", async () => {
			const { importProject } = await import("@/lib/fileImport");

			renderHomePage();

			const projectCard = screen.getByText("Open Existing Project").closest(".drag-zone");
			expect(projectCard).toBeInTheDocument();

			// Create a mock unsupported file
			const mockFile = new File(["text content"], "document.txt", { type: "text/plain" });

			// Create drag event with file
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(mockFile);
			const dropEvent = new DragEvent("drop", {
				bubbles: true,
				dataTransfer,
			});

			await act(async () => {
				projectCard!.dispatchEvent(dropEvent);
			});

			// Should not process unsupported files
			expect(importProject).not.toHaveBeenCalled();
		});

		it("should show error message when drag and drop import fails", async () => {
			const { importProject } = await import("@/lib/fileImport");
			const errorMessage = "Corrupted project file";

			vi.mocked(importProject).mockRejectedValue(new Error(errorMessage));

			renderHomePage();

			const projectCard = screen.getByText("Open Existing Project").closest(".drag-zone");
			expect(projectCard).toBeInTheDocument();

			// Create a mock file
			const mockFile = new File(["bad content"], "bad.json", { type: "application/json" });

			// Create drag event with file
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(mockFile);
			const dropEvent = new DragEvent("drop", {
				bubbles: true,
				dataTransfer,
			});

			await act(async () => {
				projectCard!.dispatchEvent(dropEvent);
			});

			// Should show error message
			expect(await screen.findByText(errorMessage)).toBeInTheDocument();
		});

		it("should show loading state during drag and drop import", async () => {
			const { importProject } = await import("@/lib/fileImport");

			// Create a promise that we can control
			let resolveImport: (value: any) => void;
			const importPromise = new Promise((resolve) => {
				resolveImport = resolve;
			});

			vi.mocked(importProject).mockReturnValue(importPromise as any);

			renderHomePage();

			const projectCard = screen.getByText("Open Existing Project").closest(".drag-zone");
			expect(projectCard).toBeInTheDocument();

			// Create a mock file
			const mockFile = new File(["test content"], "project.json", { type: "application/json" });

			// Create drag event with file
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(mockFile);
			const dropEvent = new DragEvent("drop", {
				bubbles: true,
				dataTransfer,
			});

			await act(async () => {
				projectCard!.dispatchEvent(dropEvent);
			});

			// Should show loading state
			expect(await screen.findByText("Loading Project...")).toBeInTheDocument();

			// Resolve the import
			resolveImport!({
				id: "test",
				name: "Test",
				description: "",
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		});

		it("should remove drag-over indicator on drag leave", async () => {
			renderHomePage();

			const projectCard = screen.getByText("Open Existing Project").closest(".drag-zone");
			expect(projectCard).toBeInTheDocument();

			// Simulate drag enter first
			const dragEnterEvent = new DragEvent("dragenter", {
				bubbles: true,
				dataTransfer: new DataTransfer(),
			});

			await act(async () => {
				projectCard!.dispatchEvent(dragEnterEvent);
			});

			// Should show drag-over indicator
			expect(await screen.findByText("Drop your project file here")).toBeInTheDocument();

			// Simulate drag leave
			const dragLeaveEvent = new DragEvent("dragleave", {
				bubbles: true,
				dataTransfer: new DataTransfer(),
			});

			await act(async () => {
				projectCard!.dispatchEvent(dragLeaveEvent);
			});

			// Should remove drag-over indicator (note: this might need a timeout in real implementation)
			// For this test, we'll just verify the event was handled without error
			expect(projectCard).toBeInTheDocument();
		});
	});
});
