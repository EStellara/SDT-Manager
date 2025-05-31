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
	avatar?: string;
	color?: string;
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
