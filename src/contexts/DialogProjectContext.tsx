import React, { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import type { DialogProject, DialogTree, DialogNode, Character } from "@/types/dialog";

interface DialogProjectState {
	currentProject: DialogProject | null;
	selectedTreeId: string | null;
	selectedNodeId: string | null;
}

type DialogProjectAction =
	| { type: "CREATE_PROJECT"; payload: { name: string; description?: string } }
	| { type: "LOAD_PROJECT"; payload: DialogProject }
	| { type: "UPDATE_PROJECT"; payload: Partial<DialogProject> }
	| { type: "CREATE_TREE"; payload: { name: string; description?: string } }
	| { type: "SELECT_TREE"; payload: string }
	| { type: "UPDATE_TREE"; payload: { treeId: string; updates: Partial<DialogTree> } }
	| { type: "DELETE_TREE"; payload: string }
	| { type: "ADD_NODE"; payload: { treeId: string; node: DialogNode } }
	| { type: "UPDATE_NODE"; payload: { treeId: string; nodeId: string; updates: Partial<DialogNode> } }
	| { type: "DELETE_NODE"; payload: { treeId: string; nodeId: string } }
	| { type: "SELECT_NODE"; payload: string | null }
	| { type: "ADD_CHARACTER"; payload: Character }
	| { type: "UPDATE_CHARACTER"; payload: { characterId: string; updates: Partial<Character> } }
	| { type: "DELETE_CHARACTER"; payload: string };

const initialState: DialogProjectState = {
	currentProject: null,
	selectedTreeId: null,
	selectedNodeId: null,
};

function dialogProjectReducer(state: DialogProjectState, action: DialogProjectAction): DialogProjectState {
	switch (action.type) {
		case "CREATE_PROJECT": {
			const newProject: DialogProject = {
				id: uuidv4(),
				name: action.payload.name,
				description: action.payload.description,
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			return {
				...state,
				currentProject: newProject,
				selectedTreeId: null,
				selectedNodeId: null,
			};
		}

		case "LOAD_PROJECT":
			return {
				...state,
				currentProject: action.payload,
				selectedTreeId: null,
				selectedNodeId: null,
			};

		case "UPDATE_PROJECT":
			if (!state.currentProject) return state;
			return {
				...state,
				currentProject: {
					...state.currentProject,
					...action.payload,
					updatedAt: new Date(),
				},
			};

		case "CREATE_TREE": {
			if (!state.currentProject) return state;
			const newTree: DialogTree = {
				id: uuidv4(),
				name: action.payload.name,
				description: action.payload.description,
				nodes: [],
				connections: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			return {
				...state,
				currentProject: {
					...state.currentProject,
					dialogTrees: [...state.currentProject.dialogTrees, newTree],
					updatedAt: new Date(),
				},
				selectedTreeId: newTree.id,
			};
		}

		case "SELECT_TREE":
			return {
				...state,
				selectedTreeId: action.payload,
				selectedNodeId: null,
			};

		case "UPDATE_TREE": {
			if (!state.currentProject) return state;
			const updatedTrees = state.currentProject.dialogTrees.map((tree) =>
				tree.id === action.payload.treeId ? { ...tree, ...action.payload.updates, updatedAt: new Date() } : tree
			);
			return {
				...state,
				currentProject: {
					...state.currentProject,
					dialogTrees: updatedTrees,
					updatedAt: new Date(),
				},
			};
		}

		case "DELETE_TREE": {
			if (!state.currentProject) return state;
			const filteredTrees = state.currentProject.dialogTrees.filter((tree) => tree.id !== action.payload);
			return {
				...state,
				currentProject: {
					...state.currentProject,
					dialogTrees: filteredTrees,
					updatedAt: new Date(),
				},
				selectedTreeId: state.selectedTreeId === action.payload ? null : state.selectedTreeId,
			};
		}

		case "ADD_NODE": {
			if (!state.currentProject) return state;
			const updatedTrees = state.currentProject.dialogTrees.map((tree) =>
				tree.id === action.payload.treeId
					? {
							...tree,
							nodes: [...tree.nodes, action.payload.node],
							updatedAt: new Date(),
					  }
					: tree
			);
			return {
				...state,
				currentProject: {
					...state.currentProject,
					dialogTrees: updatedTrees,
					updatedAt: new Date(),
				},
			};
		}

		case "UPDATE_NODE": {
			if (!state.currentProject) return state;
			const updatedTrees = state.currentProject.dialogTrees.map((tree) =>
				tree.id === action.payload.treeId
					? {
							...tree,
							nodes: tree.nodes.map((node) =>
								node.id === action.payload.nodeId ? { ...node, ...action.payload.updates } : node
							),
							updatedAt: new Date(),
					  }
					: tree
			);
			return {
				...state,
				currentProject: {
					...state.currentProject,
					dialogTrees: updatedTrees,
					updatedAt: new Date(),
				},
			};
		}

		case "DELETE_NODE": {
			if (!state.currentProject) return state;
			const updatedTrees = state.currentProject.dialogTrees.map((tree) =>
				tree.id === action.payload.treeId
					? {
							...tree,
							nodes: tree.nodes.filter((node) => node.id !== action.payload.nodeId),
							connections: tree.connections.filter(
								(conn) => conn.source !== action.payload.nodeId && conn.target !== action.payload.nodeId
							),
							updatedAt: new Date(),
					  }
					: tree
			);
			return {
				...state,
				currentProject: {
					...state.currentProject,
					dialogTrees: updatedTrees,
					updatedAt: new Date(),
				},
				selectedNodeId: state.selectedNodeId === action.payload.nodeId ? null : state.selectedNodeId,
			};
		}

		case "SELECT_NODE":
			return {
				...state,
				selectedNodeId: action.payload,
			};

		case "ADD_CHARACTER": {
			if (!state.currentProject) return state;
			return {
				...state,
				currentProject: {
					...state.currentProject,
					characters: [...state.currentProject.characters, action.payload],
					updatedAt: new Date(),
				},
			};
		}

		case "UPDATE_CHARACTER": {
			if (!state.currentProject) return state;
			const updatedCharacters = state.currentProject.characters.map((character) =>
				character.id === action.payload.characterId ? { ...character, ...action.payload.updates } : character
			);
			return {
				...state,
				currentProject: {
					...state.currentProject,
					characters: updatedCharacters,
					updatedAt: new Date(),
				},
			};
		}

		case "DELETE_CHARACTER": {
			if (!state.currentProject) return state;
			const filteredCharacters = state.currentProject.characters.filter(
				(character) => character.id !== action.payload
			);
			return {
				...state,
				currentProject: {
					...state.currentProject,
					characters: filteredCharacters,
					updatedAt: new Date(),
				},
			};
		}

		default:
			return state;
	}
}

interface DialogProjectContextType {
	state: DialogProjectState;
	dispatch: React.Dispatch<DialogProjectAction>;
	// Helper functions
	createProject: (name: string, description?: string) => void;
	createTree: (name: string, description?: string) => void;
	selectTree: (treeId: string) => void;
	getCurrentTree: () => DialogTree | null;
	addNode: (node: DialogNode) => void;
	updateNode: (nodeId: string, updates: Partial<DialogNode>) => void;
	deleteNode: (nodeId: string) => void;
}

const DialogProjectContext = createContext<DialogProjectContextType | null>(null);

export function DialogProjectProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(dialogProjectReducer, initialState);

	const createProject = (name: string, description?: string) => {
		dispatch({ type: "CREATE_PROJECT", payload: { name, description } });
	};

	const createTree = (name: string, description?: string) => {
		dispatch({ type: "CREATE_TREE", payload: { name, description } });
	};

	const selectTree = (treeId: string) => {
		dispatch({ type: "SELECT_TREE", payload: treeId });
	};

	const getCurrentTree = (): DialogTree | null => {
		if (!state.currentProject || !state.selectedTreeId) return null;
		return state.currentProject.dialogTrees.find((tree) => tree.id === state.selectedTreeId) || null;
	};

	const addNode = (node: DialogNode) => {
		if (!state.selectedTreeId) return;
		dispatch({ type: "ADD_NODE", payload: { treeId: state.selectedTreeId, node } });
	};

	const updateNode = (nodeId: string, updates: Partial<DialogNode>) => {
		if (!state.selectedTreeId) return;
		dispatch({ type: "UPDATE_NODE", payload: { treeId: state.selectedTreeId, nodeId, updates } });
	};

	const deleteNode = (nodeId: string) => {
		if (!state.selectedTreeId) return;
		dispatch({ type: "DELETE_NODE", payload: { treeId: state.selectedTreeId, nodeId } });
	};

	const contextValue: DialogProjectContextType = {
		state,
		dispatch,
		createProject,
		createTree,
		selectTree,
		getCurrentTree,
		addNode,
		updateNode,
		deleteNode,
	};

	return <DialogProjectContext.Provider value={contextValue}>{children}</DialogProjectContext.Provider>;
}

export function useDialogProject() {
	const context = useContext(DialogProjectContext);
	if (!context) {
		throw new Error("useDialogProject must be used within a DialogProjectProvider");
	}
	return context;
}
