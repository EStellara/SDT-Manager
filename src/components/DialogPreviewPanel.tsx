import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Square, RotateCcw, User, MessageCircle, ArrowRight, Clock, MapPin } from "lucide-react";
import { useDialogProject } from "@/contexts/DialogProjectContext";
import type { DialogNode, Character } from "@/types/dialog";

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
	const [autoAdvance, setAutoAdvance] = useState(false);

	useEffect(() => {
		if (isOpen && currentTree && !isPlaying) {
			// Reset to start node when opening
			const startNode = findStartNode();
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

	const findStartNode = (): DialogNode | null => {
		if (currentTree.startNodeId) {
			return currentTree.nodes.find((node) => node.id === currentTree.startNodeId) || null;
		}

		// Find first NPC or action node as fallback
		return (
			currentTree.nodes.find((node) => node.type === "npc" || node.type === "action") ||
			currentTree.nodes[0] ||
			null
		);
	};

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

	const getConnectionsFromChoice = (fromNodeId: string, choiceId: string): DialogNode[] => {
		const connections = currentTree.connections.filter(
			(conn) => conn.source === fromNodeId && conn.sourceHandle === choiceId
		);
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
	const evaluateCondition = (condition: string): boolean => {
		// Enhanced condition evaluation system
		try {
			console.log(`Evaluating condition: ${condition}`);

			// Parse simple conditions like:
			// "playerHealth > 50", "hasItem('key')", "questCompleted", "level >= 5"
			const trimmed = condition.trim();

			// Handle boolean variables
			if (dialogState.variables[trimmed] !== undefined) {
				return Boolean(dialogState.variables[trimmed]);
			}

			// Handle simple comparisons (variable operator value)
			const comparisonMatch = trimmed.match(/^(\w+)\s*([><=!]+)\s*(\d+)$/);
			if (comparisonMatch) {
				const [, variable, operator, valueStr] = comparisonMatch;
				const variableValue = Number(dialogState.variables[variable]) || 0;
				const targetValue = Number(valueStr);

				switch (operator) {
					case ">":
						return variableValue > targetValue;
					case ">=":
						return variableValue >= targetValue;
					case "<":
						return variableValue < targetValue;
					case "<=":
						return variableValue <= targetValue;
					case "==":
						return variableValue === targetValue;
					case "!=":
						return variableValue !== targetValue;
					default:
						return false;
				}
			}

			// Handle function calls like hasItem('key')
			const functionMatch = trimmed.match(/^(\w+)\(['"]([^'"]+)['"]\)$/);
			if (functionMatch) {
				const [, functionName, parameter] = functionMatch;

				switch (functionName) {
					case "hasItem":
						return dialogState.variables[`item_${parameter}`] === true;
					case "questCompleted":
						return dialogState.variables[`quest_${parameter}`] === "completed";
					default:
						return false;
				}
			}

			// For demo purposes, simulate some realistic conditions
			if (trimmed.includes("playerHealth")) return Math.random() > 0.4;
			if (trimmed.includes("hasItem")) return Math.random() > 0.6;
			if (trimmed.includes("quest")) return Math.random() > 0.5;

			// Default to random for unknown conditions
			return Math.random() > 0.5;
		} catch (error) {
			console.error("Error evaluating condition:", error);
			return false;
		}
	};
	const executeAction = (action: string) => {
		// Enhanced action execution system
		console.log(`Executing action: ${action}`);

		setDialogState((prev) => {
			const newVariables = { ...prev.variables };

			try {
				const trimmed = action.trim();

				// Handle variable assignments: setVar playerHealth 75
				const setVarMatch = trimmed.match(/^setVar\s+(\w+)\s+(.+)$/);
				if (setVarMatch) {
					const [, variable, valueStr] = setVarMatch;
					const numValue = Number(valueStr);
					newVariables[variable] = isNaN(numValue) ? valueStr : numValue;
					return { ...prev, variables: newVariables };
				}

				// Handle item additions: addItem key
				const addItemMatch = trimmed.match(/^addItem\s+['"]?([^'"]+)['"]?$/);
				if (addItemMatch) {
					const [, itemName] = addItemMatch;
					newVariables[`item_${itemName}`] = true;
					return { ...prev, variables: newVariables };
				}

				// Handle item removal: removeItem key
				const removeItemMatch = trimmed.match(/^removeItem\s+['"]?([^'"]+)['"]?$/);
				if (removeItemMatch) {
					const [, itemName] = removeItemMatch;
					newVariables[`item_${itemName}`] = false;
					return { ...prev, variables: newVariables };
				}

				// Handle quest completion: completeQuest mainQuest
				const questMatch = trimmed.match(/^completeQuest\s+['"]?([^'"]+)['"]?$/);
				if (questMatch) {
					const [, questName] = questMatch;
					newVariables[`quest_${questName}`] = "completed";
					return { ...prev, variables: newVariables };
				}

				// Handle health/stat modifications: modifyHealth +10 or modifyHealth -5
				const healthMatch = trimmed.match(/^modifyHealth\s+([+-]?\d+)$/);
				if (healthMatch) {
					const [, deltaStr] = healthMatch;
					const delta = Number(deltaStr);
					const currentHealth = Number(newVariables["playerHealth"]) || 100;
					newVariables["playerHealth"] = Math.max(0, Math.min(100, currentHealth + delta));
					return { ...prev, variables: newVariables };
				}

				// Generic action logging
				newVariables[`action_${Date.now()}`] = trimmed;
			} catch (error) {
				console.error("Error executing action:", error);
				newVariables[`error_${Date.now()}`] = `Failed to execute: ${action}`;
			}

			return { ...prev, variables: newVariables };
		});
	};

	const startPreview = () => {
		setIsPlaying(true);
		const startNode = findStartNode();

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
	const progressPercentage = Math.round((dialogState.visitedNodes.size / currentTree.nodes.length) * 100);

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Play className="w-5 h-5" />
							<div>
								<div>Dialog Preview - {currentTree.name}</div>
								<div className="text-xs text-muted-foreground font-normal">
									{dialogState.visitedNodes.size} of {currentTree.nodes.length} nodes visited
								</div>
							</div>
						</div>{" "}
						<div className="flex items-center gap-2">
							{!isPlaying ? (
								<Button onClick={startPreview} size="sm">
									<Play className="w-4 h-4 mr-1" />
									Start
								</Button>
							) : (
								<>
									<Button
										onClick={() => setAutoAdvance(!autoAdvance)}
										variant={autoAdvance ? "default" : "outline"}
										size="sm"
									>
										Auto
									</Button>
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

					{/* Progress Bar */}
					{isPlaying && (
						<div className="space-y-2">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>Progress</span>
								<span>{progressPercentage}%</span>
							</div>
							<Progress value={progressPercentage} className="h-2" />
						</div>
					)}
				</CardHeader>

				<CardContent className="space-y-6">
					{!isPlaying ? (
						<div className="text-center py-8">
							<Play className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">Ready to Preview</h3>
							<p className="text-muted-foreground mb-4">
								Click Start to begin testing your dialog tree from the beginning.
							</p>
							{currentTree.nodes.length === 0 ? (
								<div className="text-amber-600 mb-4">
									⚠️ No nodes in this dialog tree. Add some nodes first.
								</div>
							) : (
								<Button onClick={startPreview}>
									<Play className="w-4 h-4 mr-2" />
									Start Dialog Preview
								</Button>
							)}
						</div>
					) : (
						<div className="grid grid-cols-3 gap-6">
							{/* Main Dialog Area */}
							<div className="col-span-2 space-y-6">
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
													<Badge variant="outline" className="text-xs">
														{currentNode.data.title}
													</Badge>
												</div>

												{currentNode.data.content && (
													<div className="text-lg leading-relaxed p-4 bg-secondary/20 rounded">
														{currentNode.data.content}
													</div>
												)}

												{/* Handle different node types */}
												{currentNode.type === "player_choice" && currentNode.data.choices && (
													<div className="space-y-2 mt-6">
														<div className="font-medium text-sm text-muted-foreground">
															Choose your response:
														</div>
														{currentNode.data.choices.map((choice, index) => {
															const choiceNextNodes = getConnectionsFromChoice(
																currentNode.id,
																choice.id
															);
															return (
																<Button
																	key={choice.id}
																	variant="outline"
																	className="w-full justify-start h-auto p-4 text-left"
																	onClick={() => {
																		if (choiceNextNodes.length > 0) {
																			navigateToNode(
																				choiceNextNodes[0].id,
																				choice.text
																			);
																		}
																	}}
																	disabled={choiceNextNodes.length === 0}
																>
																	<span className="font-medium mr-2">
																		{index + 1}.
																	</span>
																	<span className="flex-1">{choice.text}</span>
																	{choiceNextNodes.length > 0 && (
																		<ArrowRight className="w-4 h-4 ml-2" />
																	)}
																</Button>
															);
														})}
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
																<ArrowRight className="w-4 h-4 ml-2" />
															</Button>
														</div>
													)}

												{/* Conditional Node */}
												{currentNode.type === "conditional" && (
													<div className="mt-6 space-y-3">
														<div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
															<div className="text-sm font-medium text-yellow-800">
																Evaluating Condition:
															</div>
															<div className="text-xs text-yellow-700 mt-1">
																{currentNode.data.content}
															</div>
														</div>
														{nextNodes.length >= 2 && (
															<div className="grid grid-cols-2 gap-2">
																<Button
																	onClick={() => {
																		const result = evaluateCondition(
																			currentNode.data.content || ""
																		);
																		const targetNode = result
																			? nextNodes[0]
																			: nextNodes[1];
																		navigateToNode(
																			targetNode.id,
																			result
																				? "Condition: TRUE"
																				: "Condition: FALSE"
																		);
																	}}
																	variant="outline"
																>
																	Evaluate Condition
																</Button>
															</div>
														)}
													</div>
												)}

												{/* Action Node */}
												{currentNode.type === "action" && (
													<div className="mt-6">
														<div className="p-3 bg-blue-50 border border-blue-200 rounded mb-3">
															<div className="text-sm font-medium text-blue-800">
																Executing Action:
															</div>
															<div className="text-xs text-blue-700 mt-1">
																{currentNode.data.content}
															</div>
														</div>
														{nextNodes.length > 0 && (
															<Button
																onClick={() => {
																	executeAction(currentNode.data.content || "");
																	navigateToNode(nextNodes[0].id);
																}}
																className="w-full"
															>
																Execute & Continue
																<ArrowRight className="w-4 h-4 ml-2" />
															</Button>
														)}
													</div>
												)}

												{/* End Node */}
												{currentNode.type === "end" && (
													<div className="text-center py-4">
														<div className="text-lg font-semibold mb-2">
															Dialog Complete
														</div>
														<p className="text-muted-foreground mb-4">
															{currentNode.data.content || "This conversation has ended."}
														</p>
														<Button onClick={resetPreview}>Start Over</Button>
													</div>
												)}

												{/* No connections warning */}
												{currentNode.type !== "end" && nextNodes.length === 0 && (
													<div className="text-center py-4 text-amber-600">
														⚠️ This node has no connections. The dialog cannot continue.
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								)}
							</div>

							{/* Sidebar - History and Debug Info */}
							<div className="space-y-4">
								{/* Current State */}
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="text-sm flex items-center gap-2">
											<MapPin className="w-4 h-4" />
											Current State
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2 text-xs">
										<div>
											<span className="text-muted-foreground">Node ID:</span>
											<div className="font-mono">{currentNode?.id || "None"}</div>
										</div>
										<div>
											<span className="text-muted-foreground">Node Type:</span>
											<div>{currentNode?.type || "None"}</div>
										</div>
										<div>
											<span className="text-muted-foreground">Variables:</span>
											<div className="font-mono text-xs bg-secondary/50 p-2 rounded">
												{Object.keys(dialogState.variables).length === 0
													? "None"
													: JSON.stringify(dialogState.variables, null, 2)}
											</div>
										</div>
									</CardContent>
								</Card>

								{/* History Panel */}
								{dialogState.history.length > 1 && (
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-sm flex items-center gap-2">
												<Clock className="w-4 h-4" />
												Conversation History
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2 max-h-60 overflow-y-auto">
												{dialogState.history.slice(-10).map((entry, index) => {
													const node = currentTree.nodes.find((n) => n.id === entry.nodeId);
													const nodeCharacter = getCharacter(node?.data.character);

													return (
														<div
															key={index}
															className="text-xs p-2 bg-secondary/50 rounded"
														>
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
															<div className="text-muted-foreground">
																{entry.timestamp.toLocaleTimeString()}
															</div>
														</div>
													);
												})}
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
