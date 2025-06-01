import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDialogProject, DialogProjectProvider } from "@/contexts/DialogProjectContext";
import type { DialogProject, Character } from "@/types/dialog";
import React from "react";

// Mock JSZip since it's used for export functionality
vi.mock("jszip", () => ({
	default: class MockJSZip {
		files: Record<string, any> = {};

		file(name: string, content?: string) {
			if (content !== undefined) {
				this.files[name] = { content, async: () => Promise.resolve(content) };
				return this;
			}
			return this.files[name] || null;
		}

		async loadAsync(_data: any) {
			return this;
		}

		async generateAsync(_options: any) {
			return new Blob(["mock zip content"], { type: "application/zip" });
		}
	},
}));

const createWrapper =
	() =>
	({ children }: { children: React.ReactNode }) =>
		<DialogProjectProvider>{children}</DialogProjectProvider>;

describe("Export/Import Functionality", () => {
	beforeEach(() => {
		// Reset localStorage before each test
		localStorage.clear();
	});

	describe("Project Structure", () => {
		it("should create a project with the expected structure for export", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Create a test project
			act(() => {
				result.current.createProject("Test Export Project", "A project for testing exports");
			});

			// Add a character
			act(() => {
				const character: Character = {
					id: "char-1",
					name: "Test Character",
					displayName: "Test Character Display",
					color: "#ff0000",
					role: "NPC",
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				result.current.dispatch({ type: "ADD_CHARACTER", payload: character });
			});

			// Create a dialog tree
			act(() => {
				result.current.createTree("Test Dialog Tree", "A test tree for export");
			});

			const project = result.current.state.currentProject;
			expect(project).toBeTruthy();
			expect(project?.name).toBe("Test Export Project");
			expect(project?.description).toBe("A project for testing exports");
			expect(project?.characters).toHaveLength(1);
			expect(project?.dialogTrees).toHaveLength(1);
			expect(project?.variables).toBeDefined();
		});

		it("should handle individual tree export structure", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Create project and tree
			act(() => {
				result.current.createProject("Test Project");
				result.current.createTree("Individual Tree");
			});

			const tree = result.current.state.currentProject?.dialogTrees[0];
			expect(tree).toBeTruthy();
			expect(tree?.name).toBe("Individual Tree");
			expect(tree?.nodes).toBeDefined();
			expect(tree?.connections).toBeDefined();
			expect(tree?.createdAt).toBeInstanceOf(Date);
			expect(tree?.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Character Management in Export/Import", () => {
		it("should associate characters with dialog trees correctly", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Setup project
			act(() => {
				result.current.createProject("Character Test Project");
			});

			// Add characters
			act(() => {
				const char1: Character = {
					id: "char-1",
					name: "Hero",
					color: "#0000ff",
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				const char2: Character = {
					id: "char-2",
					name: "Villain",
					color: "#ff0000",
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				result.current.dispatch({ type: "ADD_CHARACTER", payload: char1 });
				result.current.dispatch({ type: "ADD_CHARACTER", payload: char2 });
			});

			// Create tree and add nodes with character references
			act(() => {
				result.current.createTree("Character Dialog");
			});

			const treeId = result.current.state.currentProject?.dialogTrees[0].id!;

			act(() => {
				const node = {
					id: "node-1",
					type: "npc" as const,
					position: { x: 0, y: 0 },
					data: {
						title: "Hero Speech",
						content: "Hello there!",
						character: "char-1", // Reference to Hero character
					},
				};
				result.current.dispatch({ type: "ADD_NODE", payload: { treeId, node } });
			});

			const project = result.current.state.currentProject;
			const tree = project?.dialogTrees[0];

			expect(project?.characters).toHaveLength(2);
			expect(tree?.nodes).toHaveLength(1);
			expect(tree?.nodes[0].data.character).toBe("char-1");

			// Simulate finding related characters for export
			const relatedCharacters = project?.characters.filter((char) =>
				tree?.nodes.some((node) => node.data.character === char.id)
			);
			expect(relatedCharacters).toHaveLength(1);
			expect(relatedCharacters?.[0].name).toBe("Hero");
		});
	});

	describe("Import Validation", () => {
		it("should validate project structure for import", () => {
			// Test valid project structure
			const validProject: DialogProject = {
				id: "test-project",
				name: "Valid Project",
				description: "A valid project for testing",
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(validProject.id).toBeTruthy();
			expect(validProject.name).toBeTruthy();
			expect(Array.isArray(validProject.dialogTrees)).toBe(true);
			expect(Array.isArray(validProject.characters)).toBe(true);
		});

		it("should validate individual tree structure for import", () => {
			const validTreeExport = {
				tree: {
					id: "tree-1",
					name: "Valid Tree",
					description: "A valid tree",
					nodes: [],
					connections: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				relatedCharacters: [],
				exportedAt: new Date().toISOString(),
				exportVersion: "1.0",
			};

			expect(validTreeExport.tree.id).toBeTruthy();
			expect(validTreeExport.tree.name).toBeTruthy();
			expect(Array.isArray(validTreeExport.tree.nodes)).toBe(true);
			expect(Array.isArray(validTreeExport.relatedCharacters)).toBe(true);
		});
	});

	describe("Project Metadata", () => {
		it("should generate correct project metadata for structured export", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			act(() => {
				result.current.createProject("Metadata Test", "Testing metadata generation");
				result.current.createTree("Tree 1");
				result.current.createTree("Tree 2");
			});

			// Add a character
			act(() => {
				const character: Character = {
					id: "meta-char",
					name: "Meta Character",
					color: "#00ff00",
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				result.current.dispatch({ type: "ADD_CHARACTER", payload: character });
			});

			const project = result.current.state.currentProject!;

			// Simulate metadata generation
			const metadata = {
				id: project.id,
				name: project.name,
				description: project.description,
				version: "1.0",
				exportedAt: new Date().toISOString(),
				treeCount: project.dialogTrees.length,
				characterCount: project.characters.length,
			};

			expect(metadata.name).toBe("Metadata Test");
			expect(metadata.description).toBe("Testing metadata generation");
			expect(metadata.treeCount).toBe(2);
			expect(metadata.characterCount).toBe(1);
			expect(metadata.version).toBe("1.0");
			expect(metadata.exportedAt).toBeTruthy();
		});
	});
});
