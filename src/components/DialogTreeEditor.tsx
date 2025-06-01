import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
	ReactFlow,
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	BackgroundVariant,
	applyNodeChanges,
	applyEdgeChanges,
	MarkerType,
} from "@xyflow/react";
import type { Node, Edge, Connection, NodeChange, EdgeChange } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useDialogProject } from "@/contexts/DialogProjectContext";
import { DialogNodeComponent } from "./DialogNodeComponent";
import { NodeEditPanel } from "./NodeEditPanel";
import { DialogPreviewPanel } from "./DialogPreviewPanel";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save, Trash2, MessageCircle, Users, GitBranch, Zap, Square } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { DialogNode as DialogNodeType, DialogConnection } from "@/types/dialog";

const nodeTypes = {
	dialogNode: DialogNodeComponent,
};

export function DialogTreeEditor() {
	const { state, getCurrentTree, addNode, updateNode, deleteNode, dispatch } = useDialogProject();
	const currentTree = getCurrentTree();
	const [selectedNode, setSelectedNode] = useState<DialogNodeType | null>(null);
	const [showPreview, setShowPreview] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [lastSaveTime, setLastSaveTime] = useState<Date>(new Date());
	const [copiedNode, setCopiedNode] = useState<DialogNodeType | null>(null);
	const [undoStack, setUndoStack] = useState<any[]>([]);
	const [redoStack, setRedoStack] = useState<any[]>([]);
	const [hasRecoveryData, setHasRecoveryData] = useState(false); // Check for recovery data on component mount
	useEffect(() => {
		const backupData = localStorage.getItem("sdt_autosave_backup");
		if (backupData && !state.currentProject) {
			setHasRecoveryData(true);
		}
	}, [state.currentProject]);

	// Recovery functions
	const recoverFromBackup = useCallback(() => {
		const backupData = localStorage.getItem("sdt_autosave_backup");
		if (backupData) {
			try {
				const projectData = JSON.parse(backupData);
				dispatch({ type: "LOAD_PROJECT", payload: projectData });
				setHasRecoveryData(false);
				localStorage.removeItem("sdt_autosave_backup");
			} catch (error) {
				console.error("Failed to recover from backup:", error);
			}
		}
	}, [dispatch]);

	const dismissRecovery = useCallback(() => {
		localStorage.removeItem("sdt_autosave_backup");
		setHasRecoveryData(false);
	}, []);
	// Auto-save functionality - save every 30 seconds if there are unsaved changes
	useEffect(() => {
		if (!hasUnsavedChanges || !currentTree) return;

		const autoSaveInterval = setInterval(() => {
			console.log("Auto-saving dialog tree...");
			// Save to localStorage as backup
			if (state.currentProject) {
				localStorage.setItem("sdt_autosave_backup", JSON.stringify(state.currentProject));
			}
			setLastSaveTime(new Date());
			setHasUnsavedChanges(false);
		}, 30000); // 30 seconds

		return () => clearInterval(autoSaveInterval);
	}, [hasUnsavedChanges, currentTree, state.currentProject]);

	// Save tree state for undo functionality
	const saveStateForUndo = useCallback(() => {
		if (!currentTree) return;

		const state = {
			nodes: JSON.parse(JSON.stringify(currentTree.nodes)),
			connections: JSON.parse(JSON.stringify(currentTree.connections)),
		};

		setUndoStack((prev) => [...prev.slice(-9), state]); // Keep last 10 states
		setRedoStack([]); // Clear redo stack when new action is performed
	}, [currentTree]);

	// Undo functionality
	const performUndo = useCallback(() => {
		if (undoStack.length === 0 || !state.selectedTreeId) return;

		const currentState = {
			nodes: JSON.parse(JSON.stringify(currentTree?.nodes || [])),
			connections: JSON.parse(JSON.stringify(currentTree?.connections || [])),
		};

		const previousState = undoStack[undoStack.length - 1];
		setUndoStack((prev) => prev.slice(0, -1));
		setRedoStack((prev) => [...prev, currentState]);

		dispatch({
			type: "UPDATE_TREE",
			payload: {
				treeId: state.selectedTreeId,
				updates: {
					nodes: previousState.nodes,
					connections: previousState.connections,
				},
			},
		});
	}, [undoStack, currentTree, state.selectedTreeId, dispatch]);

	// Redo functionality
	const performRedo = useCallback(() => {
		if (redoStack.length === 0 || !state.selectedTreeId) return;

		const currentState = {
			nodes: JSON.parse(JSON.stringify(currentTree?.nodes || [])),
			connections: JSON.parse(JSON.stringify(currentTree?.connections || [])),
		};

		const nextState = redoStack[redoStack.length - 1];
		setRedoStack((prev) => prev.slice(0, -1));
		setUndoStack((prev) => [...prev, currentState]);

		dispatch({
			type: "UPDATE_TREE",
			payload: {
				treeId: state.selectedTreeId,
				updates: {
					nodes: nextState.nodes,
					connections: nextState.connections,
				},
			},
		});
	}, [redoStack, currentTree, state.selectedTreeId, dispatch]);

	// Copy node functionality
	const copySelectedNode = useCallback(() => {
		if (!selectedNode) return;
		setCopiedNode(JSON.parse(JSON.stringify(selectedNode)));
	}, [selectedNode]);

	// Paste node functionality
	const pasteNode = useCallback(() => {
		if (!copiedNode || !currentTree) return;

		const newNode: DialogNodeType = {
			...copiedNode,
			id: uuidv4(),
			position: {
				x: copiedNode.position.x + 50,
				y: copiedNode.position.y + 50,
			},
		};

		saveStateForUndo();
		addNode(newNode);
		setHasUnsavedChanges(true);
		setSelectedNode(newNode);
	}, [copiedNode, currentTree, addNode, saveStateForUndo]);
	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Ctrl+S or Cmd+S for save
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				console.log("Saving dialog tree via keyboard shortcut...");
				setLastSaveTime(new Date());
				setHasUnsavedChanges(false);
				return;
			}

			// Ctrl+Z or Cmd+Z for undo
			if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
				event.preventDefault();
				performUndo();
				return;
			}

			// Ctrl+Shift+Z or Ctrl+Y for redo
			if ((event.ctrlKey || event.metaKey) && (event.key === "y" || (event.key === "z" && event.shiftKey))) {
				event.preventDefault();
				performRedo();
				return;
			}

			// Ctrl+C or Cmd+C for copy
			if ((event.ctrlKey || event.metaKey) && event.key === "c" && selectedNode) {
				event.preventDefault();
				copySelectedNode();
				return;
			}

			// Ctrl+V or Cmd+V for paste
			if ((event.ctrlKey || event.metaKey) && event.key === "v" && copiedNode) {
				event.preventDefault();
				pasteNode();
				return;
			}

			// Delete key for selected node
			if (event.key === "Delete" && selectedNode) {
				event.preventDefault();
				saveStateForUndo();
				deleteNode(selectedNode.id);
				setSelectedNode(null);
				setHasUnsavedChanges(true);
				return;
			}

			// Escape key to deselect
			if (event.key === "Escape") {
				setSelectedNode(null);
				return;
			}

			// Ctrl+P or Cmd+P for preview
			if ((event.ctrlKey || event.metaKey) && event.key === "p") {
				event.preventDefault();
				setShowPreview(!showPreview);
				return;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [
		selectedNode,
		deleteNode,
		showPreview,
		performUndo,
		performRedo,
		copySelectedNode,
		pasteNode,
		copiedNode,
		saveStateForUndo,
	]);

	// Define addNewNodeAtPosition before handleDrop so it can be used in the dependency array
	const addNewNodeAtPosition = useCallback(
		(type: DialogNodeType["type"], position: { x: number; y: number }) => {
			const nodeId = uuidv4();
			const titles = {
				npc: "NPC Dialog",
				player_choice: "Player Choice",
				conditional: "Conditional Branch",
				action: "Action",
				end: "End Dialog",
			};

			const newNode: DialogNodeType = {
				id: nodeId,
				type,
				position,
				data: {
					title: titles[type],
					content: type === "npc" ? "Hello, how can I help you?" : undefined,
					choices: type === "player_choice" ? [{ id: uuidv4(), text: "Option 1" }] : undefined,
				},
			};

			saveStateForUndo();
			addNode(newNode);
			setHasUnsavedChanges(true);
			setSelectedNode(newNode);
		},
		[saveStateForUndo, addNode]
	);

	// Handle drag and drop from palette
	const handleDrop = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault();

			const reactFlowBounds = event.currentTarget.getBoundingClientRect();
			const type = event.dataTransfer.getData("application/reactflow");

			if (!type) return;

			const position = {
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			};

			addNewNodeAtPosition(type as DialogNodeType["type"], position);
		},
		[addNewNodeAtPosition]
	);

	const handleDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	// Convert our dialog nodes to ReactFlow nodes
	const flowNodes: Node[] = useMemo(() => {
		if (!currentTree) return [];

		return currentTree.nodes.map((node) => ({
			id: node.id,
			type: "dialogNode",
			position: node.position,
			data: {
				...node.data,
				nodeType: node.type,
			},
		}));
	}, [currentTree]); // Convert our dialog connections to ReactFlow edges
	const flowEdges: Edge[] = useMemo(() => {
		if (!currentTree) return [];

		return currentTree.connections.map((connection) => ({
			id: connection.id,
			source: connection.source,
			target: connection.target,
			sourceHandle: connection.sourceHandle,
			targetHandle: connection.targetHandle,
			animated: true,
			style: { stroke: "#6b7280", strokeWidth: 2 },
			markerEnd: {
				type: MarkerType.ArrowClosed,
				color: "#6b7280",
			},
		}));
	}, [currentTree]);
	const [nodes, setNodes] = useNodesState(flowNodes);
	const [edges, setEdges] = useEdgesState(flowEdges);

	// Update local state when currentTree changes
	React.useEffect(() => {
		setNodes(flowNodes);
		setEdges(flowEdges);
		setHasUnsavedChanges(false);
	}, [flowNodes, flowEdges, setNodes, setEdges]);

	// Handle node changes (including position updates)
	const handleNodesChange = useCallback(
		(changes: NodeChange[]) => {
			const updatedNodes = applyNodeChanges(changes, nodes);
			setNodes(updatedNodes);

			// Check for position changes and update the project
			const positionChanges = changes.filter((change) => change.type === "position" && change.position);
			if (positionChanges.length > 0 && currentTree) {
				positionChanges.forEach((change) => {
					if (change.type === "position" && change.position) {
						const nodeToUpdate = currentTree.nodes.find((n) => n.id === change.id);
						if (nodeToUpdate) {
							updateNode(change.id, { position: change.position });
						}
					}
				});
			}

			// Check for deletion changes
			const deletionChanges = changes.filter((change) => change.type === "remove");
			if (deletionChanges.length > 0) {
				deletionChanges.forEach((change) => {
					if (change.type === "remove") {
						deleteNode(change.id);
					}
				});
			}

			setHasUnsavedChanges(true);
		},
		[nodes, setNodes, currentTree, updateNode, deleteNode]
	);

	// Handle edge changes (including deletion)
	const handleEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			const updatedEdges = applyEdgeChanges(changes, edges);
			setEdges(updatedEdges);

			// Handle edge deletions
			const deletionChanges = changes.filter((change) => change.type === "remove");
			if (deletionChanges.length > 0 && currentTree && state.selectedTreeId) {
				deletionChanges.forEach((change) => {
					if (change.type === "remove") {
						dispatch({
							type: "UPDATE_TREE",
							payload: {
								treeId: state.selectedTreeId!,
								updates: {
									connections: currentTree.connections.filter((conn) => conn.id !== change.id),
								},
							},
						});
					}
				});
			}

			setHasUnsavedChanges(true);
		},
		[edges, setEdges, currentTree, state.selectedTreeId, dispatch]
	);

	// Handle new connections
	const handleConnect = useCallback(
		(params: Connection) => {
			if (!currentTree || !state.selectedTreeId) return;

			const newEdge = addEdge(params, edges);
			setEdges(newEdge);

			// Create the connection object for our data model
			const newConnection: DialogConnection = {
				id: uuidv4(),
				source: params.source!,
				target: params.target!,
				sourceHandle: params.sourceHandle || undefined,
				targetHandle: params.targetHandle || undefined,
			};

			// Update the tree in our project context
			dispatch({
				type: "UPDATE_TREE",
				payload: {
					treeId: state.selectedTreeId,
					updates: {
						connections: [...currentTree.connections, newConnection],
					},
				},
			});

			setHasUnsavedChanges(true);
		},
		[edges, setEdges, currentTree, state.selectedTreeId, dispatch]
	);
	const onNodeClick = useCallback(
		(_event: React.MouseEvent, node: Node) => {
			// Find the corresponding DialogNodeType
			const dialogNode = currentTree?.nodes.find((n) => n.id === node.id);
			if (dialogNode) {
				setSelectedNode(dialogNode);
			}
		},
		[currentTree]
	);

	const handleSaveNode = useCallback(
		(updatedNode: DialogNodeType) => {
			updateNode(updatedNode.id, updatedNode);
			setSelectedNode(null);
			setHasUnsavedChanges(false);
		},
		[updateNode]
	);
	const addNewNode = useCallback(
		(nodeType: DialogNodeType["type"]) => {
			// Find a good position for the new node (avoid overlaps)
			const existingPositions = currentTree?.nodes.map((n) => n.position) || [];
			let x = 100;
			let y = 100;

			// Simple positioning logic to avoid overlaps
			if (existingPositions.length > 0) {
				const lastNode = existingPositions[existingPositions.length - 1];
				x = lastNode.x + 250;
				y = lastNode.y;

				// Wrap to next row if too far right
				if (x > 800) {
					x = 100;
					y = lastNode.y + 200;
				}
			}

			const newNode: DialogNodeType = {
				id: uuidv4(),
				type: nodeType,
				position: { x, y },
				data: {
					title: `New ${nodeType.replace("_", " ")} node`,
					content:
						nodeType === "npc"
							? "Enter dialog text here..."
							: nodeType === "action"
							? "Enter action description..."
							: nodeType === "conditional"
							? "Enter condition logic..."
							: "",
					choices: nodeType === "player_choice" ? [{ id: uuidv4(), text: "Choice 1" }] : undefined,
				},
			};

			saveStateForUndo();
			addNode(newNode);
			setHasUnsavedChanges(true);
		},
		[addNode, currentTree, saveStateForUndo]
	);

	const clearAllNodes = useCallback(() => {
		if (!currentTree || !state.selectedTreeId) return;

		if (confirm("Are you sure you want to clear all nodes? This action cannot be undone.")) {
			dispatch({
				type: "UPDATE_TREE",
				payload: {
					treeId: state.selectedTreeId,
					updates: {
						nodes: [],
						connections: [],
					},
				},
			});
			setSelectedNode(null);
			setHasUnsavedChanges(false);
		}
	}, [currentTree, state.selectedTreeId, dispatch]);

	const saveTree = useCallback(() => {
		if (!currentTree || !state.selectedTreeId) return;

		// Force a tree update to ensure everything is saved
		dispatch({
			type: "UPDATE_TREE",
			payload: {
				treeId: state.selectedTreeId,
				updates: {
					updatedAt: new Date(),
				},
			},
		});
		setHasUnsavedChanges(false);
	}, [currentTree, state.selectedTreeId, dispatch]);

	if (!state.currentProject) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">No Project Loaded</h2>
					<p className="text-muted-foreground">Create or load a project to start building dialog trees.</p>
				</div>
			</div>
		);
	}

	if (!currentTree) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">No Dialog Tree Selected</h2>
					<p className="text-muted-foreground">Select a dialog tree or create a new one to start editing.</p>
				</div>
			</div>
		);
	}
	return (
		<div className="w-full h-full flex relative">
			{/* Node Palette Sidebar */}
			<div className="w-64 bg-background border-r border-border p-4 space-y-4">
				<div className="text-sm font-semibold mb-3">Node Palette</div>
				{/* Drag-and-drop node items */}
				<div className="space-y-2">
					<div
						className="p-3 border border-border rounded cursor-grab hover:bg-secondary/50 flex items-center gap-2"
						draggable
						onDragStart={(e) => {
							e.dataTransfer.setData("application/reactflow", "npc");
							e.dataTransfer.effectAllowed = "move";
						}}
					>
						<MessageCircle className="w-4 h-4 text-blue-500" />
						<span className="text-sm">NPC Dialog</span>
					</div>

					<div
						className="p-3 border border-border rounded cursor-grab hover:bg-secondary/50 flex items-center gap-2"
						draggable
						onDragStart={(e) => {
							e.dataTransfer.setData("application/reactflow", "player_choice");
							e.dataTransfer.effectAllowed = "move";
						}}
					>
						<Users className="w-4 h-4 text-green-500" />
						<span className="text-sm">Player Choice</span>
					</div>

					<div
						className="p-3 border border-border rounded cursor-grab hover:bg-secondary/50 flex items-center gap-2"
						draggable
						onDragStart={(e) => {
							e.dataTransfer.setData("application/reactflow", "conditional");
							e.dataTransfer.effectAllowed = "move";
						}}
					>
						<GitBranch className="w-4 h-4 text-yellow-500" />
						<span className="text-sm">Conditional</span>
					</div>

					<div
						className="p-3 border border-border rounded cursor-grab hover:bg-secondary/50 flex items-center gap-2"
						draggable
						onDragStart={(e) => {
							e.dataTransfer.setData("application/reactflow", "action");
							e.dataTransfer.effectAllowed = "move";
						}}
					>
						<Zap className="w-4 h-4 text-red-500" />
						<span className="text-sm">Action</span>
					</div>

					<div
						className="p-3 border border-border rounded cursor-grab hover:bg-secondary/50 flex items-center gap-2"
						draggable
						onDragStart={(e) => {
							e.dataTransfer.setData("application/reactflow", "end");
							e.dataTransfer.effectAllowed = "move";
						}}
					>
						<Square className="w-4 h-4 text-gray-500" />
						<span className="text-sm">End Dialog</span>
					</div>
				</div>{" "}
				{/* Keyboard shortcuts help */}
				<div className="pt-4 border-t border-border">
					<div className="text-xs font-medium mb-2">Shortcuts</div>
					<div className="text-xs text-muted-foreground space-y-1">
						<div>Ctrl+S - Save</div>
						<div>Ctrl+P - Preview</div>
						<div>Ctrl+Z - Undo</div>
						<div>Ctrl+Y - Redo</div>
						<div>Ctrl+C - Copy node</div>
						<div>Ctrl+V - Paste node</div>
						<div>Delete - Remove node</div>
						<div>Esc - Deselect</div>
					</div>
				</div>
			</div>

			<div className="flex-1 relative">
				{/* Toolbar */}
				<div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
					{/* Node Creation Buttons */}
					<div className="flex gap-2">
						<Button
							onClick={() => addNewNode("npc")}
							size="sm"
							variant="outline"
							className="bg-background/90 backdrop-blur-sm"
						>
							<Plus className="w-4 h-4 mr-1" />
							NPC Dialog
						</Button>
						<Button
							onClick={() => addNewNode("player_choice")}
							size="sm"
							variant="outline"
							className="bg-background/90 backdrop-blur-sm"
						>
							<Plus className="w-4 h-4 mr-1" />
							Player Choice
						</Button>
						<Button
							onClick={() => addNewNode("conditional")}
							size="sm"
							variant="outline"
							className="bg-background/90 backdrop-blur-sm"
						>
							<Plus className="w-4 h-4 mr-1" />
							Conditional
						</Button>
						<Button
							onClick={() => addNewNode("action")}
							size="sm"
							variant="outline"
							className="bg-background/90 backdrop-blur-sm"
						>
							<Plus className="w-4 h-4 mr-1" />
							Action
						</Button>
						<Button
							onClick={() => addNewNode("end")}
							size="sm"
							variant="outline"
							className="bg-background/90 backdrop-blur-sm"
						>
							<Plus className="w-4 h-4 mr-1" />
							End
						</Button>
					</div>

					<div className="border-l border-border mx-2 h-8" />

					{/* Action Buttons */}
					<div className="flex gap-2">
						{hasUnsavedChanges && (
							<Button
								onClick={saveTree}
								size="sm"
								variant="default"
								className="bg-green-600 hover:bg-green-700"
							>
								<Save className="w-4 h-4 mr-1" />
								Save
							</Button>
						)}
						<Button
							onClick={clearAllNodes}
							size="sm"
							variant="outline"
							className="bg-background/90 backdrop-blur-sm text-red-600 hover:text-red-700"
							disabled={!currentTree.nodes.length}
						>
							<Trash2 className="w-4 h-4 mr-1" />
							Clear All
						</Button>
						<Button
							onClick={() => setShowPreview(!showPreview)}
							size="sm"
							variant={showPreview ? "default" : "outline"}
							className="bg-background/90 backdrop-blur-sm"
						>
							<Play className="w-4 h-4 mr-1" />
							Preview
						</Button>
					</div>
				</div>{" "}
				{/* Status Bar */}
				<div className="absolute top-4 right-4 z-10 space-y-2">
					{hasUnsavedChanges && (
						<div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-1 rounded text-sm">
							Unsaved changes
						</div>
					)}
					<div className="bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs">
						Last saved: {lastSaveTime.toLocaleTimeString()}
					</div>
				</div>{" "}
				{/* React Flow */}{" "}
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={handleNodesChange}
					onEdgesChange={handleEdgesChange}
					onConnect={handleConnect}
					onNodeClick={onNodeClick}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					nodeTypes={nodeTypes}
					fitView
					className="bg-background h-full w-full"
					deleteKeyCode={["Backspace", "Delete"]}
					multiSelectionKeyCode={["Meta", "Ctrl"]}
				>
					<Controls className="bg-background border border-border" />
					<MiniMap
						className="bg-background border border-border"
						nodeColor={(node) => {
							switch (node.data?.nodeType) {
								case "npc":
									return "#3b82f6";
								case "player_choice":
									return "#10b981";
								case "conditional":
									return "#f59e0b";
								case "action":
									return "#ef4444";
								case "end":
									return "#6b7280";
								default:
									return "#8b5cf6";
							}
						}}
					/>
					<Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-30" />
				</ReactFlow>
			</div>

			{/* Node Edit Panel */}
			{selectedNode && (
				<NodeEditPanel node={selectedNode} onClose={() => setSelectedNode(null)} onSave={handleSaveNode} />
			)}

			{/* Dialog Preview Panel */}
			{showPreview && <DialogPreviewPanel isOpen={showPreview} onClose={() => setShowPreview(false)} />}
		</div>
	);
}
