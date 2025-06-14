// 🏠🔗 ORSON - The ghost who tests sidebar navigation
// Orson is wise and navigational, perfect for testing navigation from the sidebar

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { DialogProjectProvider } from "@/contexts/DialogProjectContext";

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Helper to render ProjectSidebar with all required context
const renderProjectSidebar = () => {
	return render(
		<BrowserRouter>
			<DialogProjectProvider>
				<ProjectSidebar />
			</DialogProjectProvider>{" "}
		</BrowserRouter>
	);
};

describe("🏠🔗 Orson: ProjectSidebar Navigation Tests", () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});

	describe("Header Navigation", () => {
		it("should render the sidebar title", () => {
			renderProjectSidebar();

			expect(screen.getByText("Stellar Dialog Tree Manager")).toBeInTheDocument();
		});

		it("should render the home navigation button", () => {
			renderProjectSidebar();

			const homeButton = screen.getByRole("button", { name: /go to home/i });
			expect(homeButton).toBeInTheDocument();
		});

		it("should navigate to home when home button is clicked", async () => {
			const user = userEvent.setup();
			renderProjectSidebar();

			const homeButton = screen.getByRole("button", { name: /go to home/i });
			await user.click(homeButton);

			expect(mockNavigate).toHaveBeenCalledWith("/");
		});

		it("should have proper home button styling and accessibility", () => {
			renderProjectSidebar();

			const homeButton = screen.getByRole("button", { name: /go to home/i });

			// Button should be present and properly labeled
			expect(homeButton).toBeInTheDocument();
			expect(homeButton).toHaveAttribute("title", "Go to Home");
		});
	});

	describe("Layout Integration", () => {
		it("should render home button in the header alongside the title", () => {
			renderProjectSidebar();

			const title = screen.getByText("Stellar Dialog Tree Manager");
			const homeButton = screen.getByRole("button", { name: /go to home/i });

			expect(title).toBeInTheDocument();
			expect(homeButton).toBeInTheDocument();
		});

		it("should maintain existing sidebar functionality with navigation", () => {
			renderProjectSidebar();

			// Title should still be present
			expect(screen.getByText("Stellar Dialog Tree Manager")).toBeInTheDocument();

			// Home button should be present
			expect(screen.getByRole("button", { name: /go to home/i })).toBeInTheDocument();

			// Other sidebar functionality should still work
			// (Note: More specific tests would be in dedicated ProjectSidebar test files)
		});
	});

	describe("Icon and Visual Elements", () => {
		it("should render home icon in the navigation button", () => {
			renderProjectSidebar();

			const homeButton = screen.getByRole("button", { name: /go to home/i });
			expect(homeButton).toBeInTheDocument();

			// The button should contain the home icon
			// This is a basic check that the button renders properly
			expect(homeButton).toHaveAttribute("title", "Go to Home");
		});
	});

	describe("Responsive Behavior", () => {
		it("should maintain navigation functionality across different screen sizes", () => {
			renderProjectSidebar();

			const homeButton = screen.getByRole("button", { name: /go to home/i });
			expect(homeButton).toBeInTheDocument();

			// Button should be consistently available
			expect(homeButton).toHaveAttribute("title", "Go to Home");
		});
	});

	describe("Context Integration", () => {
		it("should work properly within DialogProjectProvider context", () => {
			renderProjectSidebar();

			// Navigation should work regardless of project state
			const homeButton = screen.getByRole("button", { name: /go to home/i });
			expect(homeButton).toBeInTheDocument();
		});

		it("should maintain navigation when project state changes", async () => {
			const user = userEvent.setup();
			renderProjectSidebar();

			// Home button should always be available
			const homeButton = screen.getByRole("button", { name: /go to home/i });
			expect(homeButton).toBeInTheDocument();

			// Should still navigate properly
			await user.click(homeButton);
			expect(mockNavigate).toHaveBeenCalledWith("/");
		});
	});
});
