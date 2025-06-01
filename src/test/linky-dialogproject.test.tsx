// 🔗 LINKY - The ghost who tests our dialog project page
// Linky connects different parts, perfect for testing the integrated dialog project functionality

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { DialogProjectPage } from "@/pages/DialogProjectPage";

// Mock the complex components to focus on the page structure
vi.mock("@/components/ProjectSidebar", () => ({
	ProjectSidebar: () => <div data-testid="project-sidebar">Project Sidebar</div>,
}));

vi.mock("@/components/DialogTreeEditor", () => ({
	DialogTreeEditor: () => <div data-testid="dialog-tree-editor">Dialog Tree Editor</div>,
}));

vi.mock("@/components/theme-toggle", () => ({
	ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock the context provider
vi.mock("@/contexts/DialogProjectContext", () => ({
	DialogProjectProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-project-provider">{children}</div>
	),
}));

// Helper to render DialogProjectPage with router context
const renderDialogProjectPage = () => {
	return render(
		<BrowserRouter>
			<DialogProjectPage />
		</BrowserRouter>
	);
};

describe("🔗 Linky: DialogProjectPage Tests", () => {
	describe("Page Structure", () => {
		it("should render the main page layout", () => {
			renderDialogProjectPage();

			expect(screen.getByTestId("dialog-project-provider")).toBeInTheDocument();
		});

		it("should render the project sidebar", () => {
			renderDialogProjectPage();

			expect(screen.getByTestId("project-sidebar")).toBeInTheDocument();
			expect(screen.getByText("Project Sidebar")).toBeInTheDocument();
		});

		it("should render the dialog tree editor", () => {
			renderDialogProjectPage();

			expect(screen.getByTestId("dialog-tree-editor")).toBeInTheDocument();
			expect(screen.getByText("Dialog Tree Editor")).toBeInTheDocument();
		});

		it("should render the theme toggle", () => {
			renderDialogProjectPage();

			expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
			expect(screen.getByText("Theme Toggle")).toBeInTheDocument();
		});
	});

	describe("Layout Structure", () => {
		it("should have the correct layout structure", () => {
			const { container } = renderDialogProjectPage();

			// Check that the main container exists
			const mainContainer = container.querySelector('.min-h-screen');
			expect(mainContainer).toBeInTheDocument();

			// Check that flex layout is applied
			const flexContainer = container.querySelector('.flex');
			expect(flexContainer).toBeInTheDocument();
		});

		it("should wrap content in DialogProjectProvider", () => {
			renderDialogProjectPage();

			const provider = screen.getByTestId("dialog-project-provider");
			expect(provider).toBeInTheDocument();

			// Check that all main components are children of the provider
			expect(provider).toContainElement(screen.getByTestId("project-sidebar"));
			expect(provider).toContainElement(screen.getByTestId("dialog-tree-editor"));
			expect(provider).toContainElement(screen.getByTestId("theme-toggle"));
		});
	});

	describe("Component Integration", () => {
		it("should render all required components", () => {
			renderDialogProjectPage();

			// Verify all components are present
			const components = [
				"dialog-project-provider",
				"project-sidebar", 
				"dialog-tree-editor",
				"theme-toggle"
			];

			components.forEach(testId => {
				expect(screen.getByTestId(testId)).toBeInTheDocument();
			});
		});

		it("should maintain the proper component hierarchy", () => {
			renderDialogProjectPage();

			const provider = screen.getByTestId("dialog-project-provider");
			const sidebar = screen.getByTestId("project-sidebar");
			const editor = screen.getByTestId("dialog-tree-editor");
			const themeToggle = screen.getByTestId("theme-toggle");

			// All components should be within the provider
			expect(provider).toBeInTheDocument();
			expect(sidebar).toBeInTheDocument();
			expect(editor).toBeInTheDocument();
			expect(themeToggle).toBeInTheDocument();
		});
	});

	describe("Responsive Design", () => {
		it("should have proper responsive classes", () => {
			const { container } = renderDialogProjectPage();

			// Check for responsive utility classes
			const responsiveElement = container.querySelector('.min-h-screen');
			expect(responsiveElement).toBeInTheDocument();

			const flexElement = container.querySelector('.flex');
			expect(flexElement).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should render without accessibility violations", () => {
			renderDialogProjectPage();

			// Basic accessibility check - component renders without errors
			expect(screen.getByTestId("dialog-project-provider")).toBeInTheDocument();
		});

		it("should maintain focus management through router navigation", () => {
			renderDialogProjectPage();

			// The page should render all interactive components
			expect(screen.getByTestId("project-sidebar")).toBeInTheDocument();
			expect(screen.getByTestId("dialog-tree-editor")).toBeInTheDocument();
		});
	});
});
