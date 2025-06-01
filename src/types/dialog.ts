// Core types for the dialog tree system

export interface DialogNode {
	id: string;
	type: 'npc' | 'player_choice' | 'conditional' | 'action' | 'end';
	position: { x: number; y: number };
	data: DialogNodeData;
}

export interface DialogNodeData {
	title: string;
	content?: string;
	character?: string;
	choices?: DialogChoice[];
	condition?: string;
	action?: string;
	metadata?: Record<string, any>;
}

export interface DialogChoice {
	id: string;
	text: string;
	condition?: string;
	targetNodeId?: string;
}

export interface DialogConnection {
	id: string;
	source: string;
	target: string;
	sourceHandle?: string;
	targetHandle?: string;
}

export interface DialogTree {
	id: string;
	name: string;
	description?: string;
	nodes: DialogNode[];
	connections: DialogConnection[];
	startNodeId?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Character {
	id: string;
	name: string;
	displayName?: string; // Optional display name (e.g., "Dr. Smith" vs "Marcus Smith")
	description?: string;
	avatar?: string; // URL or base64 image
	color: string; // Hex color for UI identification
	role?: string; // e.g., "Protagonist", "Antagonist", "NPC", "Merchant"
	personality?: string[]; // e.g., ["Friendly", "Mysterious", "Aggressive"]
	voiceProfile?: {
		tone?: string; // e.g., "Deep", "High", "Raspy"
		accent?: string; // e.g., "British", "Southern", "Robot"
		speed?: 'slow' | 'normal' | 'fast';
	};
	metadata?: Record<string, any>; // For game-specific data
	createdAt: Date;
	updatedAt: Date;
}

export interface DialogProject {
	id: string;
	name: string;
	description?: string;
	characters: Character[];
	dialogTrees: DialogTree[];
	variables: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}
