import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, GitBranch, Zap, Square, Edit3 } from "lucide-react";

interface DialogNodeData {
	title: string;
	content?: string;
	character?: string;
	choices?: Array<{ id: string; text: string }>;
	condition?: string;
	action?: string;
	nodeType: "npc" | "player_choice" | "conditional" | "action" | "end";
}

const nodeConfig = {
	npc: {
		icon: MessageCircle,
		color: "bg-blue-500",
		borderColor: "border-blue-500",
		label: "NPC Dialog",
	},
	player_choice: {
		icon: Users,
		color: "bg-green-500",
		borderColor: "border-green-500",
		label: "Player Choice",
	},
	conditional: {
		icon: GitBranch,
		color: "bg-yellow-500",
		borderColor: "border-yellow-500",
		label: "Conditional",
	},
	action: {
		icon: Zap,
		color: "bg-red-500",
		borderColor: "border-red-500",
		label: "Action",
	},
	end: {
		icon: Square,
		color: "bg-gray-500",
		borderColor: "border-gray-500",
		label: "End",
	},
};

export function DialogNodeComponent({ data, selected }: NodeProps) {
	const nodeData = data as unknown as DialogNodeData;
	const config = nodeConfig[nodeData.nodeType];
	const Icon = config.icon;

	return (
		<div className="min-w-[200px] max-w-[300px]">
			{/* Input Handle */}
			<Handle type="target" position={Position.Top} className="w-3 h-3 bg-border border-2 border-background" />
			<Card className={`${selected ? "ring-2 ring-primary" : ""} ${config.borderColor} border-2`}>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm">
						<div className={`p-1 rounded ${config.color} text-white`}>
							<Icon className="w-3 h-3" />
						</div>{" "}
						<span className="truncate">{nodeData.title}</span>
						<Edit3 className="w-3 h-3 ml-auto text-muted-foreground" />
					</CardTitle>
				</CardHeader>

				<CardContent className="pt-0 space-y-2">
					{/* Character Badge */}
					{nodeData.character && (
						<Badge variant="secondary" className="text-xs">
							{nodeData.character}
						</Badge>
					)}

					{/* Content */}
					{nodeData.content && <p className="text-xs text-foreground line-clamp-3">{nodeData.content}</p>}

					{/* Player Choices */}
					{nodeData.choices && nodeData.choices.length > 0 && (
						<div className="space-y-1">
							{nodeData.choices.slice(0, 3).map((choice, index) => (
								<div
									key={choice.id}
									className="text-xs text-muted-foreground bg-secondary/50 p-1 rounded"
								>
									{index + 1}. {choice.text}
								</div>
							))}
							{nodeData.choices.length > 3 && (
								<div className="text-xs text-muted-foreground">
									+{nodeData.choices.length - 3} more choices
								</div>
							)}
						</div>
					)}

					{/* Condition */}
					{nodeData.condition && (
						<div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 p-1 rounded">
							If: {nodeData.condition}
						</div>
					)}

					{/* Action */}
					{nodeData.action && (
						<div className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-1 rounded">
							Action: {nodeData.action}
						</div>
					)}
				</CardContent>
			</Card>{" "}
			{/* Output Handles */}
			{nodeData.nodeType === "player_choice" && nodeData.choices ? (
				// Multiple handles for player choices
				nodeData.choices.map((choice, index) => (
					<Handle
						key={choice.id}
						type="source"
						position={Position.Bottom}
						id={choice.id}
						style={{
							left: `${20 + index * 60}%`,
							transform: "translateX(-50%)",
						}}
						className="w-2 h-2 bg-green-500 border border-background"
					/>
				))
			) : nodeData.nodeType === "conditional" ? (
				// Two handles for conditional (true/false)
				<>
					<Handle
						type="source"
						position={Position.Bottom}
						id="true"
						style={{ left: "30%", transform: "translateX(-50%)" }}
						className="w-2 h-2 bg-green-500 border border-background"
					/>
					<Handle
						type="source"
						position={Position.Bottom}
						id="false"
						style={{ left: "70%", transform: "translateX(-50%)" }}
						className="w-2 h-2 bg-red-500 border border-background"
					/>
				</>
			) : nodeData.nodeType !== "end" ? (
				// Single handle for other types (except end)
				<Handle
					type="source"
					position={Position.Bottom}
					className="w-3 h-3 bg-border border-2 border-background"
				/>
			) : null}
		</div>
	);
}
