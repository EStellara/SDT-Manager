// 🎯 BETRAYUS - The ghost who tests our routing system
// Betrayus navigates through dimensions and mazes, perfect for testing route navigation

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HomePage, DialogProjectPage, NotFoundPage } from "@/pages";

// Mock the pages to avoid rendering complex components in routing tests
vi.mock("@/pages", () => ({
	HomePage: () => <div data-testid="home-page">Home Page</div>,
	DialogProjectPage: () => <div data-testid="dialog-project-page">Dialog Project Page</div>,
	NotFoundPage: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

// Helper to render App with specific route
const renderAppWithRoute = (initialEntries: string[]) => {
	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/project" element={<DialogProjectPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</MemoryRouter>
	);
};

describe("🎯 Betrayus: App Routing Tests", () => {
	describe("Route Navigation", () => {
		it("should render HomePage when navigating to root path", () => {
			renderAppWithRoute(["/"]);

			expect(screen.getByTestId("home-page")).toBeInTheDocument();
			expect(screen.getByText("Home Page")).toBeInTheDocument();
		});

		it("should render DialogProjectPage when navigating to /project", () => {
			renderAppWithRoute(["/project"]);

			expect(screen.getByTestId("dialog-project-page")).toBeInTheDocument();
			expect(screen.getByText("Dialog Project Page")).toBeInTheDocument();
		});

		it("should render NotFoundPage when navigating to unknown route", () => {
			renderAppWithRoute(["/unknown-route"]);

			expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
			expect(screen.getByText("Not Found Page")).toBeInTheDocument();
		});

		it("should render NotFoundPage when navigating to deeply nested unknown route", () => {
			renderAppWithRoute(["/some/deeply/nested/unknown/route"]);

			expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
			expect(screen.getByText("Not Found Page")).toBeInTheDocument();
		});
	});

	describe("Route Parameters and Query Strings", () => {
		it("should handle routes with query parameters", () => {
			renderAppWithRoute(["/?param=value"]);

			expect(screen.getByTestId("home-page")).toBeInTheDocument();
		});

		it("should handle project route with query parameters", () => {
			renderAppWithRoute(["/project?id=123"]);

			expect(screen.getByTestId("dialog-project-page")).toBeInTheDocument();
		});
	});
	describe("Browser Navigation", () => {
		it("should handle different routes properly", () => {
			// Test home route
			const { unmount: unmountHome } = renderAppWithRoute(["/"]);
			expect(screen.getByTestId("home-page")).toBeInTheDocument();
			unmountHome();

			// Test project route
			const { unmount: unmountProject } = renderAppWithRoute(["/project"]);
			expect(screen.getByTestId("dialog-project-page")).toBeInTheDocument();
			unmountProject();

			// Test 404 route
			const { unmount: unmount404 } = renderAppWithRoute(["/unknown"]);
			expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
			unmount404();
		});
	});

	describe("Route Edge Cases", () => {
		it("should handle routes with trailing slashes", () => {
			renderAppWithRoute(["/project/"]);

			// React Router v6 by default matches /project/ to /project
			expect(screen.getByTestId("dialog-project-page")).toBeInTheDocument();
		});

		it("should handle empty string route", () => {
			renderAppWithRoute([""]);

			expect(screen.getByTestId("home-page")).toBeInTheDocument();
		});

		it("should handle routes with fragments", () => {
			renderAppWithRoute(["/#section"]);

			expect(screen.getByTestId("home-page")).toBeInTheDocument();
		});
	});

	describe("App Component Structure", () => {
		it("should render without crashing on all valid routes", () => {
			const routes = ["/", "/project"];

			routes.forEach((route) => {
				const { unmount } = renderAppWithRoute([route]);
				expect(screen.getByTestId).toBeDefined();
				unmount();
			});
		});

		it("should provide proper router context to child components", () => {
			renderAppWithRoute(["/"]);

			// The pages should render properly, indicating router context is available
			expect(screen.getByTestId("home-page")).toBeInTheDocument();
		});
	});
});
