// 👻 CLYDE - The orange ghost who tests our context and state management
// Clyde is unpredictable and sometimes helpful, perfect for testing complex state scenarios

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ReactNode } from "react";
import { DialogProjectProvider, useDialogProject } from "@/contexts/DialogProjectContext";
import type { DialogProject, DialogTree, DialogNode, Character } from "@/types/dialog";

// Helper wrapper for context tests
const createWrapper = () => {
	return ({ children }: { children: ReactNode }) => <DialogProjectProvider>{children}</DialogProjectProvider>;
};

describe("👻 Clyde: Context and State Management Tests", () => {
	describe("Initial State", () => {
		it("should initialize with empty state", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			expect(result.current.state.currentProject).toBeNull();
			expect(result.current.state.selectedTreeId).toBeNull();
			expect(result.current.state.selectedNodeId).toBeNull();
		});

		it("should provide all context methods", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			expect(typeof result.current.createProject).toBe("function");
			expect(typeof result.current.createTree).toBe("function");
			expect(typeof result.current.selectTree).toBe("function");
			expect(typeof result.current.dispatch).toBe("function");
		});
	});

	describe("Project Management", () => {
		it("should create a new project", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			act(() => {
				result.current.createProject("Clyde's Maze Adventure");
			});

			expect(result.current.state.currentProject).not.toBeNull();
			expect(result.current.state.currentProject?.name).toBe("Clyde's Maze Adventure");
			expect(result.current.state.currentProject?.characters).toEqual([]);
			expect(result.current.state.currentProject?.dialogTrees).toEqual([]);
		});

		it("should handle project creation with description", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			act(() => {
				result.current.dispatch({
					type: "CREATE_PROJECT",
					payload: {
						name: "Clyde's Complex Story",
						description: "A story with unpredictable twists and turns",
					},
				});
			});

			expect(result.current.state.currentProject?.name).toBe("Clyde's Complex Story");
			expect(result.current.state.currentProject?.description).toBe(
				"A story with unpredictable twists and turns"
			);
		});

		it("should update existing project", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// First create a project
			act(() => {
				result.current.createProject("Original Name");
			});

			// Then update it
			act(() => {
				result.current.dispatch({
					type: "UPDATE_PROJECT",
					payload: {
						name: "Updated Name",
						description: "Now with description",
					},
				});
			});

			expect(result.current.state.currentProject?.name).toBe("Updated Name");
			expect(result.current.state.currentProject?.description).toBe("Now with description");
		});
	});

	describe("Dialog Tree Management", () => {
		beforeEach(() => {
			// We need a project before we can create trees
		});

		it("should create a dialog tree", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Create project first
			act(() => {
				result.current.createProject("Test Project");
			});

			// Then create tree
			act(() => {
				result.current.createTree("Clyde's Conversation");
			});

			expect(result.current.state.currentProject?.dialogTrees).toHaveLength(1);
			expect(result.current.state.currentProject?.dialogTrees[0].name).toBe("Clyde's Conversation");
		});

		it("should select a dialog tree", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Setup
			act(() => {
				result.current.createProject("Test Project");
				result.current.createTree("Test Tree");
			});

			const treeId = result.current.state.currentProject?.dialogTrees[0].id!;

			// Select the tree
			act(() => {
				result.current.selectTree(treeId);
			});

			expect(result.current.state.selectedTreeId).toBe(treeId);
		});

		it("should update dialog tree properties", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Setup
			act(() => {
				result.current.createProject("Test Project");
				result.current.createTree("Original Tree Name");
			});

			const treeId = result.current.state.currentProject?.dialogTrees[0].id!;

			// Update tree
			act(() => {
				result.current.dispatch({
					type: "UPDATE_TREE",
					payload: {
						treeId,
						updates: {
							name: "Updated Tree Name",
							description: "Clyde modified this tree",
						},
					},
				});
			});

			const updatedTree = result.current.state.currentProject?.dialogTrees[0];
			expect(updatedTree?.name).toBe("Updated Tree Name");
			expect(updatedTree?.description).toBe("Clyde modified this tree");
		});

		it("should delete a dialog tree", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Setup
			act(() => {
				result.current.createProject("Test Project");
				result.current.createTree("Tree to Delete");
				result.current.createTree("Tree to Keep");
			});

			expect(result.current.state.currentProject?.dialogTrees).toHaveLength(2);

			const treeToDeleteId = result.current.state.currentProject?.dialogTrees[0].id!;

			// Delete first tree
			act(() => {
				result.current.dispatch({
					type: "DELETE_TREE",
					payload: treeToDeleteId,
				});
			});

			expect(result.current.state.currentProject?.dialogTrees).toHaveLength(1);
			expect(result.current.state.currentProject?.dialogTrees[0].name).toBe("Tree to Keep");
		});
	});

	describe("Character Management", () => {
		it("should add a character to project", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			const clydeCharacter: Character = {
				id: "clyde-orange",
				name: "Clyde",
				displayName: "Clyde the Unpredictable",
				description: "Sometimes helpful, sometimes not",
				color: "#ffa500",
				role: "Supporting Character",
				personality: ["Unpredictable", "Sometimes Helpful", "Quirky"],
				voiceProfile: {
					tone: "Variable",
					accent: "Casual",
					speed: "normal",
				},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Setup project
			act(() => {
				result.current.createProject("Test Project");
			});

			// Add character
			act(() => {
				result.current.dispatch({
					type: "ADD_CHARACTER",
					payload: clydeCharacter,
				});
			});

			expect(result.current.state.currentProject?.characters).toHaveLength(1);
			expect(result.current.state.currentProject?.characters[0].name).toBe("Clyde");
			expect(result.current.state.currentProject?.characters[0].color).toBe("#ffa500");
		});

		it("should update an existing character", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			const character: Character = {
				id: "test-clyde",
				name: "Original Clyde",
				color: "#ffa500",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Setup
			act(() => {
				result.current.createProject("Test Project");
				result.current.dispatch({ type: "ADD_CHARACTER", payload: character });
			});

			// Update character
			act(() => {
				result.current.dispatch({
					type: "UPDATE_CHARACTER",
					payload: {
						characterId: "test-clyde",
						updates: {
							name: "Updated Clyde",
							displayName: "Clyde the Changed",
							personality: ["Evolved", "Different"],
						},
					},
				});
			});

			const updatedCharacter = result.current.state.currentProject?.characters[0];
			expect(updatedCharacter?.name).toBe("Updated Clyde");
			expect(updatedCharacter?.displayName).toBe("Clyde the Changed");
			expect(updatedCharacter?.personality).toEqual(["Evolved", "Different"]);
		});

		it("should delete a character", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			const character1: Character = {
				id: "clyde-1",
				name: "Clyde One",
				color: "#ffa500",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const character2: Character = {
				id: "clyde-2",
				name: "Clyde Two",
				color: "#ffb533",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Setup
			act(() => {
				result.current.createProject("Test Project");
				result.current.dispatch({ type: "ADD_CHARACTER", payload: character1 });
				result.current.dispatch({ type: "ADD_CHARACTER", payload: character2 });
			});

			expect(result.current.state.currentProject?.characters).toHaveLength(2);

			// Delete first character
			act(() => {
				result.current.dispatch({
					type: "DELETE_CHARACTER",
					payload: "clyde-1",
				});
			});

			expect(result.current.state.currentProject?.characters).toHaveLength(1);
			expect(result.current.state.currentProject?.characters[0].name).toBe("Clyde Two");
		});
	});

	describe("Node Management", () => {
		it("should add a node to a dialog tree", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Setup
			act(() => {
				result.current.createProject("Test Project");
				result.current.createTree("Test Tree");
			});

			const treeId = result.current.state.currentProject?.dialogTrees[0].id!;
			const newNode: DialogNode = {
				id: "clyde-node-1",
				type: "npc",
				position: { x: 100, y: 100 },
				data: {
					text: "Hi! I'm Clyde, and I might help you... or not!",
					characterId: "clyde-orange",
				},
			};

			// Add node
			act(() => {
				result.current.dispatch({
					type: "ADD_NODE",
					payload: { treeId, node: newNode },
				});
			});

			const tree = result.current.state.currentProject?.dialogTrees[0];
			expect(tree?.nodes).toHaveLength(1);
			expect(tree?.nodes[0].data.text).toContain("Clyde");
		});

		it("should update a node in a dialog tree", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Setup with node
			act(() => {
				result.current.createProject("Test Project");
				result.current.createTree("Test Tree");
			});

			const treeId = result.current.state.currentProject?.dialogTrees[0].id!;
			const node: DialogNode = {
				id: "test-node",
				type: "npc",
				position: { x: 0, y: 0 },
				data: { text: "Original text" },
			};

			act(() => {
				result.current.dispatch({ type: "ADD_NODE", payload: { treeId, node } });
			});

			// Update the node
			act(() => {
				result.current.dispatch({
					type: "UPDATE_NODE",
					payload: {
						treeId,
						nodeId: "test-node",
						updates: {
							data: { text: "Updated by Clyde!" },
							position: { x: 200, y: 300 },
						},
					},
				});
			});

			const updatedTree = result.current.state.currentProject?.dialogTrees[0];
			const updatedNode = updatedTree?.nodes[0];
			expect(updatedNode?.data.text).toBe("Updated by Clyde!");
			expect(updatedNode?.position).toEqual({ x: 200, y: 300 });
		});

		it("should delete a node from dialog tree", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Setup with multiple nodes
			act(() => {
				result.current.createProject("Test Project");
				result.current.createTree("Test Tree");
			});

			const treeId = result.current.state.currentProject?.dialogTrees[0].id!;

			const node1: DialogNode = {
				id: "node-1",
				type: "npc",
				position: { x: 0, y: 0 },
				data: { text: "Node 1" },
			};

			const node2: DialogNode = {
				id: "node-2",
				type: "npc",
				position: { x: 100, y: 100 },
				data: { text: "Node 2" },
			};

			act(() => {
				result.current.dispatch({ type: "ADD_NODE", payload: { treeId, node: node1 } });
				result.current.dispatch({ type: "ADD_NODE", payload: { treeId, node: node2 } });
			});

			expect(result.current.state.currentProject?.dialogTrees[0].nodes).toHaveLength(2);

			// Delete first node
			act(() => {
				result.current.dispatch({
					type: "DELETE_NODE",
					payload: { treeId, nodeId: "node-1" },
				});
			});

			const tree = result.current.state.currentProject?.dialogTrees[0];
			expect(tree?.nodes).toHaveLength(1);
			expect(tree?.nodes[0].id).toBe("node-2");
		});
	});

	describe("Selection State Management", () => {
		it("should manage tree selection state", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Setup
			act(() => {
				result.current.createProject("Test Project");
				result.current.createTree("Tree 1");
				result.current.createTree("Tree 2");
			});

			const tree1Id = result.current.state.currentProject?.dialogTrees[0].id!;
			const tree2Id = result.current.state.currentProject?.dialogTrees[1].id!;

			// Select first tree
			act(() => {
				result.current.selectTree(tree1Id);
			});

			expect(result.current.state.selectedTreeId).toBe(tree1Id);

			// Select second tree
			act(() => {
				result.current.selectTree(tree2Id);
			});

			expect(result.current.state.selectedTreeId).toBe(tree2Id);
		});

		it("should manage node selection state", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			// Initially no node selected
			expect(result.current.state.selectedNodeId).toBeNull();

			// Select a node
			act(() => {
				result.current.dispatch({
					type: "SELECT_NODE",
					payload: "node-clyde-1",
				});
			});

			expect(result.current.state.selectedNodeId).toBe("node-clyde-1");

			// Deselect node
			act(() => {
				result.current.dispatch({
					type: "SELECT_NODE",
					payload: null,
				});
			});

			expect(result.current.state.selectedNodeId).toBeNull();
		});
	});

	describe("State Persistence and Timestamps", () => {
		it("should update timestamps when projects are modified", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useDialogProject(), { wrapper });

			const startTime = new Date();

			act(() => {
				result.current.createProject("Time Test");
			});

			const project = result.current.state.currentProject!;
			expect(project.createdAt.getTime()).toBeGreaterThanOrEqual(startTime.getTime());
			expect(project.updatedAt.getTime()).toBeGreaterThanOrEqual(startTime.getTime());

			const initialUpdatedAt = project.updatedAt; // Wait a bit then update
			setTimeout(() => {
				act(() => {
					result.current.dispatch({
						type: "UPDATE_PROJECT",
						payload: { description: "Updated description" },
					});
				});

				const updatedProject = result.current.state.currentProject!;
				expect(updatedProject.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime());
			}, 50);
		});
	});
});
