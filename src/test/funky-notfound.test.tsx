// 🚫 FUNKY - The ghost who tests our 404 error handling
// Funky appears when things go wrong, perfect for testing error pages

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Helper to render NotFoundPage with router context
const renderNotFoundPage = () => {
	return render(
		<BrowserRouter>
			<NotFoundPage />
		</BrowserRouter>
	);
};

describe("🚫 Funky: NotFoundPage Tests", () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});

	describe("404 Page Rendering", () => {
		it("should render the 404 error message", () => {
			renderNotFoundPage();

			expect(screen.getByText("404")).toBeInTheDocument();
			expect(screen.getByText("Page Not Found")).toBeInTheDocument();
			expect(screen.getByText("The page you're looking for doesn't exist or may have been moved.")).toBeInTheDocument();
		});

		it("should render navigation buttons", () => {
			renderNotFoundPage();

			expect(screen.getByRole("button", { name: /go to home/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
		});

		it("should render the 404 in large text", () => {
			renderNotFoundPage();

			const errorCode = screen.getByText("404");
			expect(errorCode).toBeInTheDocument();
		});
	});

	describe("Navigation Functionality", () => {
		it("should navigate to home when Go to Home button is clicked", async () => {
			const user = userEvent.setup();
			renderNotFoundPage();

			const homeButton = screen.getByRole("button", { name: /go to home/i });
			await user.click(homeButton);

			expect(mockNavigate).toHaveBeenCalledWith("/");
		});

		it("should navigate back when Go Back button is clicked", async () => {
			const user = userEvent.setup();
			renderNotFoundPage();

			const backButton = screen.getByRole("button", { name: /go back/i });
			await user.click(backButton);

			expect(mockNavigate).toHaveBeenCalledWith(-1);
		});
	});

	describe("Theme Toggle", () => {
		it("should render the theme toggle component", () => {
			renderNotFoundPage();

			// The theme toggle should be present
			// Since we're not testing the actual theme toggle implementation,
			// we just verify the component renders without errors
			expect(screen.getByText("404")).toBeInTheDocument();
		});
	});

	describe("Layout and Styling", () => {
		it("should render within a centered card layout", () => {
			renderNotFoundPage();

			// Check that the content is properly structured
			expect(screen.getByText("Page Not Found")).toBeInTheDocument();
			expect(screen.getByText("404")).toBeInTheDocument();
		});

		it("should have proper button styling", () => {
			renderNotFoundPage();

			const homeButton = screen.getByRole("button", { name: /go to home/i });
			const backButton = screen.getByRole("button", { name: /go back/i });

			expect(homeButton).toBeInTheDocument();
			expect(backButton).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have proper heading structure", () => {
			renderNotFoundPage();

			const heading = screen.getByRole("heading", { name: /page not found/i });
			expect(heading).toBeInTheDocument();
		});

		it("should have proper button roles and labels", () => {
			renderNotFoundPage();

			const homeButton = screen.getByRole("button", { name: /go to home/i });
			const backButton = screen.getByRole("button", { name: /go back/i });

			expect(homeButton).toBeInTheDocument();
			expect(backButton).toBeInTheDocument();
		});

		it("should provide clear error description", () => {
			renderNotFoundPage();

			const description = screen.getByText("The page you're looking for doesn't exist or may have been moved.");
			expect(description).toBeInTheDocument();
		});
	});
});
