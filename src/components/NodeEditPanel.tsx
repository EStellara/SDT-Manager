import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Save, Trash2, MessageCircle, Users, GitBranch, Zap, Square } from "lucide-react";
import { useDialogProject } from "@/contexts/DialogProjectContext";
import type { DialogNode, DialogChoice } from "@/types/dialog";

interface NodeEditPanelProps {
	node: DialogNode | null;
	onClose: () => void;
	onSave: (node: DialogNode) => void;
}

const nodeTypeConfig = {
	npc: { icon: MessageCircle, label: "NPC Dialog", color: "bg-blue-500" },
	player_choice: { icon: Users, label: "Player Choice", color: "bg-green-500" },
	conditional: { icon: GitBranch, label: "Conditional", color: "bg-yellow-500" },
	action: { icon: Zap, label: "Action", color: "bg-red-500" },
	end: { icon: Square, label: "End Dialog", color: "bg-gray-500" },
};

export function NodeEditPanel({ node, onClose, onSave }: NodeEditPanelProps) {
	const { state } = useDialogProject();
	const [formData, setFormData] = useState<Partial<DialogNode>>({});
	const [newChoice, setNewChoice] = useState("");
	const [validationErrors, setValidationErrors] = useState<string[]>([]);

	useEffect(() => {
		if (node) {
			setFormData({ ...node });
			setValidationErrors([]);
		}
	}, [node]);

	if (!node) return null;

	const currentProject = state.currentProject;
	const characters = currentProject?.characters || [];
	const config = nodeTypeConfig[node.type];
	const Icon = config.icon;

	const validateForm = (): string[] => {
		const errors: string[] = [];

		if (!formData.data?.title?.trim()) {
			errors.push("Title is required");
		}

		if (node.type === "npc" && !formData.data?.content?.trim()) {
			errors.push("Dialog content is required for NPC nodes");
		}

		if (node.type === "player_choice") {
			if (!formData.data?.choices || formData.data.choices.length === 0) {
				errors.push("At least one choice is required for Player Choice nodes");
			}
			if (formData.data?.choices?.some((choice) => !choice.text.trim())) {
				errors.push("All choices must have text");
			}
		}

		if (node.type === "conditional" && !formData.data?.content?.trim()) {
			errors.push("Condition logic is required for Conditional nodes");
		}

		if (node.type === "action" && !formData.data?.content?.trim()) {
			errors.push("Action description is required for Action nodes");
		}

		return errors;
	};

	const handleSave = () => {
		const errors = validateForm();
		setValidationErrors(errors);

		if (errors.length === 0 && formData.id && formData.type && formData.position && formData.data) {
			onSave(formData as DialogNode);
		}
	};

	const addChoice = () => {
		if (newChoice.trim() && formData.data) {
			const newChoiceObj: DialogChoice = {
				id: crypto.randomUUID(),
				text: newChoice.trim(),
			};

			setFormData((prev) => ({
				...prev,
				data: {
					...prev.data!,
					choices: [...(prev.data?.choices || []), newChoiceObj],
				},
			}));
			setNewChoice("");
		}
	};

	const removeChoice = (choiceId: string) => {
		setFormData((prev) => ({
			...prev,
			data: {
				...prev.data!,
				choices: prev.data?.choices?.filter((c) => c.id !== choiceId) || [],
			},
		}));
	};

	const updateChoice = (choiceId: string, text: string) => {
		setFormData((prev) => ({
			...prev,
			data: {
				...prev.data!,
				choices: prev.data?.choices?.map((c) => (c.id === choiceId ? { ...c, text } : c)) || [],
			},
		}));
	};

	const getSelectedCharacter = () => {
		return characters.find((char) => char.id === formData.data?.character);
	};

	return (
		<div className="w-96 border-l bg-background h-full overflow-y-auto">
			<Card className="h-full rounded-none border-0">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="flex items-center gap-2 text-lg font-semibold">
						<div className={`p-2 rounded ${config.color} text-white`}>
							<Icon className="w-4 h-4" />
						</div>
						<div>
							<div>Edit {config.label}</div>
							<div className="text-xs text-muted-foreground font-normal">ID: {node.id}</div>
						</div>
					</CardTitle>
					<Button variant="ghost" size="sm" onClick={onClose}>
						<X className="w-4 h-4" />
					</Button>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Validation Errors */}
					{validationErrors.length > 0 && (
						<div className="p-3 border border-red-200 bg-red-50 rounded">
							<div className="text-sm font-medium text-red-800 mb-2">
								Please fix the following errors:
							</div>
							<ul className="text-sm text-red-700 space-y-1">
								{validationErrors.map((error, index) => (
									<li key={index}>• {error}</li>
								))}
							</ul>
						</div>
					)}

					{/* Basic Information */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								value={formData.data?.title || ""}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										data: { ...prev.data!, title: e.target.value },
									}))
								}
								placeholder="Enter node title"
								className={
									validationErrors.some((err) => err.includes("Title")) ? "border-red-500" : ""
								}
							/>
						</div>

						{/* Position Information */}
						<div className="grid grid-cols-2 gap-2">
							<div className="space-y-2">
								<Label className="text-xs text-muted-foreground">X Position</Label>
								<Input
									type="number"
									value={formData.position?.x || 0}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											position: { ...prev.position!, x: parseInt(e.target.value) || 0 },
										}))
									}
									className="text-xs"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-xs text-muted-foreground">Y Position</Label>
								<Input
									type="number"
									value={formData.position?.y || 0}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											position: { ...prev.position!, y: parseInt(e.target.value) || 0 },
										}))
									}
									className="text-xs"
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Character Assignment */}
					{(node.type === "npc" || node.type === "player_choice") && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="character">Character</Label>
								<Select
									value={formData.data?.character || ""}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											data: { ...prev.data!, character: value },
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a character" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">No character</SelectItem>
										{characters.map((character) => (
											<SelectItem key={character.id} value={character.id}>
												<div className="flex items-center gap-2">
													<div
														className="w-3 h-3 rounded-full border"
														style={{ backgroundColor: character.color }}
													/>
													{character.displayName || character.name}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{getSelectedCharacter() && (
									<div className="p-2 bg-secondary/50 rounded text-xs">
										<div className="flex items-center gap-2 mb-1">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: getSelectedCharacter()!.color }}
											/>
											<span className="font-medium">
												{getSelectedCharacter()!.displayName || getSelectedCharacter()!.name}
											</span>
											{getSelectedCharacter()!.role && (
												<Badge variant="outline" className="text-xs">
													{getSelectedCharacter()!.role}
												</Badge>
											)}
										</div>
										{getSelectedCharacter()!.description && (
											<p className="text-muted-foreground">
												{getSelectedCharacter()!.description}
											</p>
										)}
									</div>
								)}
							</div>
						</div>
					)}

					{/* Content */}
					{(node.type === "npc" || node.type === "conditional" || node.type === "action") && (
						<div className="space-y-2">
							<Label htmlFor="content">
								{node.type === "npc"
									? "Dialog Text *"
									: node.type === "conditional"
									? "Condition Logic *"
									: "Action Description *"}
							</Label>
							<Textarea
								id="content"
								value={formData.data?.content || ""}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										data: { ...prev.data!, content: e.target.value },
									}))
								}
								placeholder={
									node.type === "npc"
										? "Enter what the character says..."
										: node.type === "conditional"
										? "Enter condition logic (e.g., playerHealth > 50)"
										: "Enter action to perform (e.g., AddItem 'HealthPotion')"
								}
								rows={4}
								className={
									validationErrors.some(
										(err) =>
											err.includes("content") ||
											err.includes("Dialog content") ||
											err.includes("Condition logic") ||
											err.includes("Action description")
									)
										? "border-red-500"
										: ""
								}
							/>{" "}
							{node.type === "conditional" && (
								<div className="text-xs text-muted-foreground">
									Examples: playerHealth &gt; 50, hasItem('key'), questCompleted('mainQuest')
								</div>
							)}
						</div>
					)}

					{/* Player Choices */}
					{node.type === "player_choice" && (
						<div className="space-y-4">
							<Label>Player Choices *</Label>

							<div className="space-y-2">
								{formData.data?.choices?.map((choice, index) => (
									<div
										key={choice.id}
										className="flex items-center gap-2 p-2 bg-secondary/30 rounded"
									>
										<div className="text-xs font-medium min-w-[20px]">{index + 1}.</div>
										<Input
											value={choice.text}
											onChange={(e) => updateChoice(choice.id, e.target.value)}
											placeholder="Choice text"
											className="flex-1"
										/>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => removeChoice(choice.id)}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								))}
							</div>

							<div className="flex gap-2">
								<Input
									value={newChoice}
									onChange={(e) => setNewChoice(e.target.value)}
									placeholder="Add new choice"
									onKeyDown={(e) => e.key === "Enter" && addChoice()}
									className="flex-1"
								/>
								<Button variant="outline" size="sm" onClick={addChoice} disabled={!newChoice.trim()}>
									<Plus className="w-4 h-4" />
								</Button>
							</div>

							{(!formData.data?.choices || formData.data.choices.length === 0) && (
								<div className="text-sm text-red-600">At least one choice is required</div>
							)}
						</div>
					)}

					{/* End Node Content */}
					{node.type === "end" && (
						<div className="space-y-2">
							<Label htmlFor="endMessage">End Message (Optional)</Label>
							<Textarea
								id="endMessage"
								value={formData.data?.content || ""}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										data: { ...prev.data!, content: e.target.value },
									}))
								}
								placeholder="Optional message to display when dialog ends..."
								rows={3}
							/>
						</div>
					)}

					{/* Actions */}
					<div className="flex gap-2 pt-4 border-t">
						<Button onClick={handleSave} className="flex-1" disabled={validationErrors.length > 0}>
							<Save className="w-4 h-4 mr-2" />
							Save Changes
						</Button>
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
