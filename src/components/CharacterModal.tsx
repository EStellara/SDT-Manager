import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Palette, User, Mic } from "lucide-react";
import type { Character } from "@/types/dialog";
import { v4 as uuidv4 } from "uuid";

interface CharacterModalProps {
	character?: Character;
	isOpen: boolean;
	onClose: () => void;
	onSave: (character: Character) => void;
}

const defaultColors = [
	"#3b82f6", // Blue
	"#10b981", // Green
	"#f59e0b", // Yellow
	"#ef4444", // Red
	"#8b5cf6", // Purple
	"#f97316", // Orange
	"#06b6d4", // Cyan
	"#84cc16", // Lime
	"#ec4899", // Pink
	"#6b7280", // Gray
];

const characterRoles = [
	"Protagonist",
	"Antagonist",
	"Supporting Character",
	"NPC",
	"Merchant",
	"Guard",
	"Narrator",
	"Quest Giver",
	"Companion",
	"Other",
];

const personalityTraits = [
	"Friendly",
	"Hostile",
	"Mysterious",
	"Cheerful",
	"Grumpy",
	"Wise",
	"Naive",
	"Aggressive",
	"Peaceful",
	"Sarcastic",
	"Honest",
	"Deceptive",
	"Brave",
	"Cowardly",
	"Loyal",
	"Treacherous",
	"Calm",
	"Nervous",
	"Confident",
	"Insecure",
];

export function CharacterModal({ character, isOpen, onClose, onSave }: CharacterModalProps) {
	const [formData, setFormData] = useState<Partial<Character>>(() => ({
		name: character?.name || "",
		displayName: character?.displayName || "",
		description: character?.description || "",
		color: character?.color || defaultColors[0],
		role: character?.role || undefined,
		personality: character?.personality || [],
		voiceProfile: {
			tone: character?.voiceProfile?.tone || "",
			accent: character?.voiceProfile?.accent || "",
			speed: character?.voiceProfile?.speed || "normal",
		},
	}));

	const [newPersonalityTrait, setNewPersonalityTrait] = useState("");

	const handleSave = () => {
		if (!formData.name?.trim()) return;

		const now = new Date();
		const characterData: Character = {
			id: character?.id || uuidv4(),
			name: formData.name.trim(),
			displayName: formData.displayName?.trim() || formData.name.trim(),
			description: formData.description?.trim(),
			color: formData.color!,
			role: formData.role,
			personality: formData.personality || [],
			voiceProfile: formData.voiceProfile,
			metadata: character?.metadata || {},
			createdAt: character?.createdAt || now,
			updatedAt: now,
		};

		onSave(characterData);
		onClose();
	};

	const addPersonalityTrait = (trait: string) => {
		if (trait && !formData.personality?.includes(trait)) {
			setFormData((prev) => ({
				...prev,
				personality: [...(prev.personality || []), trait],
			}));
		}
		setNewPersonalityTrait("");
	};

	const removePersonalityTrait = (trait: string) => {
		setFormData((prev) => ({
			...prev,
			personality: prev.personality?.filter((p) => p !== trait) || [],
		}));
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<User className="w-5 h-5" />
						{character ? "Edit Character" : "Create Character"}
					</CardTitle>
					<Button variant="ghost" size="sm" onClick={onClose}>
						<X className="w-4 h-4" />
					</Button>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Character Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
									placeholder="Enter character name"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="displayName">Display Name</Label>
								<Input
									id="displayName"
									value={formData.displayName}
									onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
									placeholder="How they appear in dialogs"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
								placeholder="Character background, appearance, or notes..."
								rows={3}
							/>
						</div>
					</div>

					{/* Visual Appearance */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Palette className="w-4 h-4" />
							<Label>Visual Appearance</Label>
						</div>

						<div className="space-y-3">
							<div className="space-y-2">
								<Label>Character Color</Label>
								<div className="flex gap-2 flex-wrap">
									{defaultColors.map((color) => (
										<button
											key={color}
											type="button"
											className={`w-8 h-8 rounded-full border-2 ${
												formData.color === color ? "border-foreground" : "border-border"
											}`}
											style={{ backgroundColor: color }}
											onClick={() => setFormData((prev) => ({ ...prev, color }))}
										/>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="role">Role</Label>{" "}
								<Select
									value={formData.role || ""}
									onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select character role" />
									</SelectTrigger>
									<SelectContent>
										{characterRoles.map((role) => (
											<SelectItem key={role} value={role}>
												{role}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Personality */}
					<div className="space-y-4">
						<Label>Personality Traits</Label>
						<div className="flex gap-2 flex-wrap">
							{formData.personality?.map((trait) => (
								<Badge key={trait} variant="secondary" className="cursor-pointer">
									{trait}
									<X className="w-3 h-3 ml-1" onClick={() => removePersonalityTrait(trait)} />
								</Badge>
							))}
						</div>

						<div className="flex gap-2">
							<Input
								value={newPersonalityTrait}
								onChange={(e) => setNewPersonalityTrait(e.target.value)}
								placeholder="Add custom trait"
								onKeyDown={(e) => e.key === "Enter" && addPersonalityTrait(newPersonalityTrait)}
							/>{" "}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => addPersonalityTrait(newPersonalityTrait)}
								aria-label="Add personality trait"
							>
								<Plus className="w-4 h-4" />
							</Button>
						</div>

						<div className="space-y-2">
							<Label>Quick Add</Label>
							<div className="flex gap-1 flex-wrap">
								{personalityTraits
									.filter((trait) => !formData.personality?.includes(trait))
									.slice(0, 8)
									.map((trait) => (
										<Button
											key={trait}
											type="button"
											variant="outline"
											size="sm"
											onClick={() => addPersonalityTrait(trait)}
											className="text-xs"
										>
											{trait}
										</Button>
									))}
							</div>
						</div>
					</div>

					{/* Voice Profile */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Mic className="w-4 h-4" />
							<Label>Voice Profile</Label>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="tone">Tone</Label>
								<Input
									id="tone"
									value={formData.voiceProfile?.tone || ""}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											voiceProfile: { ...prev.voiceProfile, tone: e.target.value },
										}))
									}
									placeholder="e.g., Deep, High"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="accent">Accent</Label>
								<Input
									id="accent"
									value={formData.voiceProfile?.accent || ""}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											voiceProfile: { ...prev.voiceProfile, accent: e.target.value },
										}))
									}
									placeholder="e.g., British, Robot"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="speed">Speed</Label>
								<Select
									value={formData.voiceProfile?.speed || "normal"}
									onValueChange={(value: "slow" | "normal" | "fast") =>
										setFormData((prev) => ({
											...prev,
											voiceProfile: { ...prev.voiceProfile, speed: value },
										}))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="slow">Slow</SelectItem>
										<SelectItem value="normal">Normal</SelectItem>
										<SelectItem value="fast">Fast</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3 justify-end pt-4 border-t">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!formData.name?.trim()}>
							{character ? "Update" : "Create"} Character
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
