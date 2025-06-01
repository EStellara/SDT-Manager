import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Save } from "lucide-react";
import { useDialogProject } from "@/contexts/DialogProjectContext";
import type { DialogNode, DialogChoice } from "@/types/dialog";

interface NodeEditPanelProps {
	node: DialogNode | null;
	onClose: () => void;
	onSave: (node: DialogNode) => void;
}

export function NodeEditPanel({ node, onClose, onSave }: NodeEditPanelProps) {
	const { state } = useDialogProject();
	const [formData, setFormData] = useState<Partial<DialogNode>>({});
	const [newChoice, setNewChoice] = useState("");

	useEffect(() => {
		if (node) {
			setFormData(node);
		}
	}, [node]);

	if (!node) return null;

	const currentProject = state.currentProject;
	const characters = currentProject?.characters || [];

	const handleSave = () => {
		if (formData.id && formData.type && formData.position && formData.data) {
			onSave(formData as DialogNode);
			onClose();
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

	return (
		<div className="w-80 border-l bg-background h-full overflow-y-auto">
			<Card className="h-full rounded-none border-0">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-lg font-semibold">Edit {node.type.replace("_", " ")} Node</CardTitle>
					<Button variant="ghost" size="sm" onClick={onClose}>
						<X className="w-4 h-4" />
					</Button>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
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
							/>
						</div>

						{/* Character Assignment */}
						{(node.type === "npc" || node.type === "player_choice") && (
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
							</div>
						)}

						{/* Content */}
						{(node.type === "npc" || node.type === "conditional" || node.type === "action") && (
							<div className="space-y-2">
								<Label htmlFor="content">
									{node.type === "npc"
										? "Dialog Text"
										: node.type === "conditional"
										? "Condition"
										: "Action"}
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
											? "Enter condition logic..."
											: "Enter action to perform..."
									}
									rows={4}
								/>
							</div>
						)}
					</div>

					{/* Player Choices */}
					{node.type === "player_choice" && (
						<div className="space-y-4">
							<Label>Player Choices</Label>

							<div className="space-y-2">
								{formData.data?.choices?.map((choice) => (
									<div key={choice.id} className="flex items-center gap-2">
										<Input
											value={choice.text}
											onChange={(e) => updateChoice(choice.id, e.target.value)}
											placeholder="Choice text"
											className="flex-1"
										/>
										<Button variant="ghost" size="sm" onClick={() => removeChoice(choice.id)}>
											<X className="w-4 h-4" />
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
								<Button variant="outline" size="sm" onClick={addChoice}>
									<Plus className="w-4 h-4" />
								</Button>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex gap-2 pt-4 border-t">
						<Button onClick={handleSave} className="flex-1">
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
