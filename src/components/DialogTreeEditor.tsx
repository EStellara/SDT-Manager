import React, { useCallback, useMemo, useState } from "react";
import {
	ReactFlow,
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	BackgroundVariant,
} from "@xyflow/react";
import type { Node, Edge, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useDialogProject } from "@/contexts/DialogProjectContext";
import { DialogNodeComponent } from "./DialogNodeComponent";
import { NodeEditPanel } from "./NodeEditPanel";
import { DialogPreviewPanel } from "./DialogPreviewPanel";
import { Button } from "@/components/ui/button";
import { Plus, Play } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { DialogNode as DialogNodeType } from "@/types/dialog";

const nodeTypes = {
	dialogNode: DialogNodeComponent,
};

export function DialogTreeEditor() {
	const { state, getCurrentTree, addNode, updateNode } = useDialogProject();
	const currentTree = getCurrentTree();
	const [selectedNode, setSelectedNode] = useState<DialogNodeType | null>(null);
	const [showPreview, setShowPreview] = useState(false);

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
	}, [currentTree]);

	// Convert our dialog connections to ReactFlow edges
	const flowEdges: Edge[] = useMemo(() => {
		if (!currentTree) return [];

		return currentTree.connections.map((connection) => ({
			id: connection.id,
			source: connection.source,
			target: connection.target,
			sourceHandle: connection.sourceHandle,
			targetHandle: connection.targetHandle,
		}));
	}, [currentTree]);

	const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

	// Update local state when currentTree changes
	React.useEffect(() => {
		setNodes(flowNodes);
		setEdges(flowEdges);
	}, [flowNodes, flowEdges, setNodes, setEdges]);

	const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
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
		},
		[updateNode]
	);

	const addNewNode = useCallback(
		(nodeType: DialogNodeType["type"]) => {
			const newNode: DialogNodeType = {
				id: uuidv4(),
				type: nodeType,
				position: {
					x: Math.random() * 300,
					y: Math.random() * 300,
				},
				data: {
					title: `New ${nodeType} node`,
					content: nodeType === "npc" ? "Enter dialog text here..." : "",
					choices: nodeType === "player_choice" ? [{ id: uuidv4(), text: "Choice 1" }] : undefined,
				},
			};

			addNode(newNode);
		},
		[addNode]
	);

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
			<div className="flex-1 relative">
				{" "}
				{/* Toolbar */}
				<div className="absolute top-4 left-4 z-10 flex gap-2">
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
					<div className="border-l border-border mx-2 h-8" />
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
				{/* React Flow */}
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onNodeClick={onNodeClick}
					nodeTypes={nodeTypes}
					fitView
					className="bg-background h-full w-full"
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
					/>{" "}
					<Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-30" />
				</ReactFlow>
			</div>{" "}
			{/* Node Edit Panel */}
			{selectedNode && (
				<NodeEditPanel node={selectedNode} onClose={() => setSelectedNode(null)} onSave={handleSaveNode} />
			)}{" "}
			{/* Dialog Preview Panel */}
			{showPreview && <DialogPreviewPanel isOpen={showPreview} onClose={() => setShowPreview(false)} />}
		</div>
	);
}
