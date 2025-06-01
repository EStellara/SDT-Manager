import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCcw, User, MessageCircle } from "lucide-react";
import { useDialogProject } from "@/contexts/DialogProjectContext";
import type { DialogNode, DialogTree, Character } from "@/types/dialog";

interface DialogPreviewPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

interface DialogState {
	currentNodeId: string | null;
	visitedNodes: Set<string>;
	variables: Record<string, any>;
	history: Array<{
		nodeId: string;
		choiceText?: string;
		timestamp: Date;
	}>;
}

export function DialogPreviewPanel({ isOpen, onClose }: DialogPreviewPanelProps) {
	const { state, getCurrentTree } = useDialogProject();
	const currentTree = getCurrentTree();

	const [dialogState, setDialogState] = useState<DialogState>({
		currentNodeId: null,
		visitedNodes: new Set(),
		variables: {},
		history: [],
	});

	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		if (isOpen && currentTree && !isPlaying) {
			// Reset to start node when opening
			const startNode = currentTree.nodes.find((node) =>
				currentTree.startNodeId
					? node.id === currentTree.startNodeId
					: node.type === "npc" || node.type === "action"
			);

			if (startNode) {
				setDialogState({
					currentNodeId: startNode.id,
					visitedNodes: new Set([startNode.id]),
					variables: {},
					history: [
						{
							nodeId: startNode.id,
							timestamp: new Date(),
						},
					],
				});
			}
		}
	}, [isOpen, currentTree, isPlaying]);

	if (!isOpen || !currentTree) return null;

	const currentProject = state.currentProject;
	const characters = currentProject?.characters || [];

	const getCurrentNode = (): DialogNode | null => {
		if (!dialogState.currentNodeId) return null;
		return currentTree.nodes.find((node) => node.id === dialogState.currentNodeId) || null;
	};

	const getCharacter = (characterId?: string): Character | null => {
		if (!characterId) return null;
		return characters.find((char) => char.id === characterId) || null;
	};

	const getNextNodes = (fromNodeId: string): DialogNode[] => {
		const connections = currentTree.connections.filter((conn) => conn.source === fromNodeId);
		return connections
			.map((conn) => currentTree.nodes.find((node) => node.id === conn.target))
			.filter(Boolean) as DialogNode[];
	};

	const navigateToNode = (nodeId: string, choiceText?: string) => {
		const node = currentTree.nodes.find((n) => n.id === nodeId);
		if (!node) return;

		setDialogState((prev) => ({
			...prev,
			currentNodeId: nodeId,
			visitedNodes: new Set([...prev.visitedNodes, nodeId]),
			history: [
				...prev.history,
				{
					nodeId,
					choiceText,
					timestamp: new Date(),
				},
			],
		}));
	};

	const startPreview = () => {
		setIsPlaying(true);
		const startNode = currentTree.nodes.find((node) =>
			currentTree.startNodeId
				? node.id === currentTree.startNodeId
				: node.type === "npc" || node.type === "action"
		);

		if (startNode) {
			setDialogState({
				currentNodeId: startNode.id,
				visitedNodes: new Set([startNode.id]),
				variables: {},
				history: [
					{
						nodeId: startNode.id,
						timestamp: new Date(),
					},
				],
			});
		}
	};

	const stopPreview = () => {
		setIsPlaying(false);
		setDialogState({
			currentNodeId: null,
			visitedNodes: new Set(),
			variables: {},
			history: [],
		});
	};

	const resetPreview = () => {
		if (isPlaying) {
			startPreview();
		}
	};

	const currentNode = getCurrentNode();
	const character = getCharacter(currentNode?.data.character);
	const nextNodes = currentNode ? getNextNodes(currentNode.id) : [];

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Play className="w-5 h-5" />
							Dialog Preview - {currentTree.name}
						</div>
						<div className="flex items-center gap-2">
							{!isPlaying ? (
								<Button onClick={startPreview} size="sm">
									<Play className="w-4 h-4 mr-1" />
									Start
								</Button>
							) : (
								<>
									<Button onClick={resetPreview} variant="outline" size="sm">
										<RotateCcw className="w-4 h-4 mr-1" />
										Restart
									</Button>
									<Button onClick={stopPreview} variant="outline" size="sm">
										<Square className="w-4 h-4 mr-1" />
										Stop
									</Button>
								</>
							)}
							<Button variant="ghost" onClick={onClose} size="sm">
								×
							</Button>
						</div>
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-6">
					{!isPlaying ? (
						<div className="text-center py-8">
							<Play className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">Ready to Preview</h3>
							<p className="text-muted-foreground mb-4">
								Click Start to begin testing your dialog tree from the beginning.
							</p>
							<Button onClick={startPreview}>
								<Play className="w-4 h-4 mr-2" />
								Start Dialog Preview
							</Button>
						</div>
					) : (
						<div className="space-y-6">
							{/* Current Dialog */}
							{currentNode && (
								<Card className="border-2">
									<CardContent className="p-6">
										{/* Character Info */}
										{character && (
											<div className="flex items-center gap-3 mb-4 pb-4 border-b">
												<div
													className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center"
													style={{ backgroundColor: character.color }}
												>
													<User className="w-5 h-5 text-white" />
												</div>
												<div>
													<div className="font-semibold">
														{character.displayName || character.name}
													</div>
													{character.role && (
														<Badge variant="secondary" className="text-xs">
															{character.role}
														</Badge>
													)}
												</div>
											</div>
										)}

										{/* Node Content */}
										<div className="space-y-4">
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<MessageCircle className="w-4 h-4" />
												<span>{currentNode.type.replace("_", " ").toUpperCase()}</span>
											</div>

											{currentNode.data.content && (
												<div className="text-lg leading-relaxed">
													{currentNode.data.content}
												</div>
											)}

											{/* Player Choices */}
											{currentNode.type === "player_choice" && currentNode.data.choices && (
												<div className="space-y-2 mt-6">
													<div className="font-medium text-sm text-muted-foreground">
														Choose your response:
													</div>
													{currentNode.data.choices.map((choice, index) => (
														<Button
															key={choice.id}
															variant="outline"
															className="w-full justify-start h-auto p-4 text-left"
															onClick={() => {
																const nextNode = nextNodes[index];
																if (nextNode) {
																	navigateToNode(nextNode.id, choice.text);
																}
															}}
														>
															<span className="font-medium mr-2">{index + 1}.</span>
															{choice.text}
														</Button>
													))}
												</div>
											)}

											{/* Continue Button for NPC dialogs */}
											{(currentNode.type === "npc" || currentNode.type === "action") &&
												nextNodes.length > 0 && (
													<div className="mt-6">
														<Button
															onClick={() => navigateToNode(nextNodes[0].id)}
															className="w-full"
														>
															Continue
														</Button>
													</div>
												)}

											{/* End Node */}
											{currentNode.type === "end" && (
												<div className="text-center py-4">
													<div className="text-lg font-semibold mb-2">Dialog Complete</div>
													<p className="text-muted-foreground mb-4">
														This conversation has ended.
													</p>
													<Button onClick={resetPreview}>Start Over</Button>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{/* History Panel */}
							{dialogState.history.length > 1 && (
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="text-sm">Conversation History</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2 max-h-40 overflow-y-auto">
											{dialogState.history.slice(-5).map((entry, index) => {
												const node = currentTree.nodes.find((n) => n.id === entry.nodeId);
												const nodeCharacter = getCharacter(node?.data.character);

												return (
													<div key={index} className="text-xs p-2 bg-secondary/50 rounded">
														<div className="flex items-center gap-2">
															{nodeCharacter && (
																<div
																	className="w-3 h-3 rounded-full"
																	style={{ backgroundColor: nodeCharacter.color }}
																/>
															)}
															<span className="font-medium">
																{node?.data.title || "Unknown Node"}
															</span>
														</div>
														{entry.choiceText && (
															<div className="text-muted-foreground mt-1">
																Choice: {entry.choiceText}
															</div>
														)}
													</div>
												);
											})}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
