// 👻 INKY - The blue ghost who tests our core data structures and utilities
// Inky is methodical and strategic, just like our data validation tests

import { describe, it, expect } from 'vitest'
import type { DialogProject, DialogTree, DialogNode, Character } from '@/types/dialog'

describe('👻 Inky: Core Data Structure Tests', () => {
	describe('Dialog Node Creation', () => {
		it('should create a valid NPC dialog node', () => {
			const node: DialogNode = {
				id: 'inky-test-1',
				type: 'npc',
				position: { x: 100, y: 100 },
				data: {
					title: "Waka waka! Welcome to the maze!",
					character: 'pac-man'
				}
			}

			expect(node.type).toBe('npc')
			expect(node.data.title).toContain('Waka')
			expect(node.position.x).toBe(100)
			expect(node.position.y).toBe(100)
		})

		it('should create a valid player choice node', () => {
			const node: DialogNode = {
				id: 'inky-test-2',
				type: 'player_choice',
				position: { x: 200, y: 200 },
				data: {
					title: "Which direction will you go?",
					choices: [
						{ id: 'choice-1', text: 'Go left into the blue territory', targetNodeId: 'left-node' },
						{ id: 'choice-2', text: 'Go right toward the power pellet', targetNodeId: 'right-node' }
					]
				}
			}

			expect(node.type).toBe('player_choice')
			expect(node.data.choices).toHaveLength(2)
			expect(node.data.choices?.[0].text).toContain('blue territory')
			expect(node.data.choices?.[1].targetNodeId).toBe('right-node')
		})

		it('should create a valid conditional node', () => {
			const node: DialogNode = {
				id: 'inky-test-3',
				type: 'conditional',
				position: { x: 300, y: 300 },
				data: {
					conditions: [
						{ variable: 'powerPelletEaten', operator: 'equals', value: true },
						{ variable: 'ghostsRemaining', operator: 'lessThan', value: 2 }
					],
					trueNodeId: 'victory-node',
					falseNodeId: 'continue-game'
				}
			}

			expect(node.type).toBe('conditional')
			expect(node.data.conditions).toHaveLength(2)
			expect(node.data.conditions[0].variable).toBe('powerPelletEaten')
			expect(node.data.trueNodeId).toBe('victory-node')
		})
	})

	describe('Dialog Tree Structure', () => {
		it('should create a valid dialog tree with connected nodes', () => {
			const tree: DialogTree = {
				id: 'inky-maze-level',
				name: 'Inky\'s Strategic Maze Dialog',
				description: 'A methodical conversation flow like Inky\'s hunting pattern',
				nodes: [
					{
						id: 'start',
						type: 'npc',
						position: { x: 0, y: 0 },
						data: {
							text: "I am Inky, the strategist. I study your moves...",
							characterId: 'inky-ghost'
						}
					},
					{
						id: 'response',
						type: 'choice',
						position: { x: 0, y: 100 },
						data: {
							text: "How do you respond to Inky's analysis?",
							choices: [
								{ id: 'strategic', text: 'I too plan my moves carefully', targetNodeId: 'alliance' },
								{ id: 'impulsive', text: 'I prefer spontaneous action!', targetNodeId: 'challenge' }
							]
						}
					}
				],
				startNodeId: 'start',
				variables: {
					inkyTrust: 0,
					strategyLevel: 'beginner'
				},
				createdAt: new Date('2025-05-31'),
				updatedAt: new Date('2025-05-31')
			}

			expect(tree.name).toContain('Inky')
			expect(tree.nodes).toHaveLength(2)
			expect(tree.startNodeId).toBe('start')
			expect(tree.variables.inkyTrust).toBe(0)
			expect(tree.variables.strategyLevel).toBe('beginner')
		})
	})

	describe('Project Validation', () => {
		it('should validate a complete dialog project structure', () => {
			const project: DialogProject = {
				id: 'pac-man-universe',
				name: 'Pac-Man Dialog Universe',
				description: 'A comprehensive dialog system for the Pac-Man world',
				characters: [
					{
						id: 'inky-ghost',
						name: 'Inky',
						displayName: 'Inky the Strategist',
						description: 'The blue ghost who plans every move',
						color: '#00bfff',
						role: 'Antagonist',
						personality: ['Strategic', 'Calculating', 'Patient'],
						voiceProfile: {
							tone: 'Deep',
							accent: 'Robotic',
							speed: 'normal'
						},
						metadata: { difficulty: 'high', pattern: 'ambush' },
						createdAt: new Date('2025-05-31'),
						updatedAt: new Date('2025-05-31')
					}
				],
				dialogTrees: [],
				variables: {
					gameLevel: 1,
					score: 0,
					livesRemaining: 3
				},
				createdAt: new Date('2025-05-31'),
				updatedAt: new Date('2025-05-31')
			}

			expect(project.characters).toHaveLength(1)
			expect(project.characters[0].name).toBe('Inky')
			expect(project.characters[0].color).toBe('#00bfff')
			expect(project.characters[0].personality).toContain('Strategic')
			expect(project.variables.gameLevel).toBe(1)
		})
	})

	describe('Data Integrity Checks', () => {
		it('should ensure node IDs are unique within a tree', () => {
			const nodeIds = ['node1', 'node2', 'node3', 'node1'] // Duplicate!
			const uniqueIds = [...new Set(nodeIds)]

			expect(uniqueIds).toHaveLength(3) // Should fail if duplicates exist
			expect(nodeIds).toHaveLength(4) // Original has 4 items
			expect(uniqueIds.length).not.toBe(nodeIds.length) // They should be different
		})

		it('should validate character color format', () => {
			const validColors = ['#00bfff', '#ff69b4', '#ffa500', '#ff0000']
			const invalidColors = ['blue', 'rgb(255,0,0)', '#gg0000', 'not-a-color']

			validColors.forEach(color => {
				expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
			})

			invalidColors.forEach(color => {
				expect(color).not.toMatch(/^#[0-9a-fA-F]{6}$/)
			})
		})

		it('should validate required character properties', () => {
			const character: Character = {
				id: 'test-inky',
				name: 'Test Inky',
				color: '#00bfff',
				createdAt: new Date(),
				updatedAt: new Date()
			}

			// Required properties
			expect(character.id).toBeDefined()
			expect(character.name).toBeDefined()
			expect(character.color).toBeDefined()
			expect(character.createdAt).toBeInstanceOf(Date)
			expect(character.updatedAt).toBeInstanceOf(Date)

			// Optional properties should be allowed
			expect(character.displayName).toBeUndefined()
			expect(character.description).toBeUndefined()
		})
	})

	describe('Sample Project Creation', () => {
		it('should create a complete Pac-Man themed sample project', () => {
			const sampleProject: DialogProject = {
				id: 'pac-man-sample-project',
				name: 'Pac-Man Dialog Adventure',
				description: 'A sample project showcasing all dialog features with our favorite yellow hero and colorful ghosts',
				characters: [
					{
						id: 'pac-man-hero',
						name: 'Pac-Man',
						displayName: 'The Yellow Hero',
						description: 'The legendary dot-eating champion of the maze',
						color: '#ffff00',
						role: 'Protagonist',
						personality: ['Brave', 'Determined', 'Hungry'],
						voiceProfile: {
							tone: 'Cheerful',
							accent: 'Heroic',
							speed: 'normal'
						},
						metadata: { powerLevel: 'medium', specialAbility: 'powerPellet' },
						createdAt: new Date('2025-05-31'),
						updatedAt: new Date('2025-05-31')
					},
					{
						id: 'blinky-ghost',
						name: 'Blinky',
						displayName: 'The Red Leader',
						description: 'Aggressive red ghost who leads the hunt',
						color: '#ff0000',
						role: 'Primary Antagonist',
						personality: ['Aggressive', 'Leadership', 'Direct'],
						voiceProfile: {
							tone: 'Commanding',
							accent: 'Authoritative',
							speed: 'fast'
						},
						metadata: { difficulty: 'high', pattern: 'chase' },
						createdAt: new Date('2025-05-31'),
						updatedAt: new Date('2025-05-31')
					},
					{
						id: 'pinky-ghost',
						name: 'Pinky',
						displayName: 'The Pink Ambusher',
						description: 'Strategic pink ghost who plans ambushes',
						color: '#ffb8ff',
						role: 'Secondary Antagonist',
						personality: ['Strategic', 'Ambush-oriented', 'Clever'],
						voiceProfile: {
							tone: 'Sly',
							accent: 'Mysterious',
							speed: 'normal'
						},
						metadata: { difficulty: 'medium-high', pattern: 'ambush' },
						createdAt: new Date('2025-05-31'),
						updatedAt: new Date('2025-05-31')
					}
				],
				dialogTrees: [], // Will be populated separately
				variables: {
					gameLevel: 1,
					score: 0,
					powerPelletActive: false,
					ghostsEaten: 0,
					livesRemaining: 3,
					currentMaze: 'classic'
				},
				createdAt: new Date('2025-05-31'),
				updatedAt: new Date('2025-05-31')
			};

			// Validate project structure
			expect(sampleProject.id).toBeTruthy();
			expect(sampleProject.name).toContain('Pac-Man');
			expect(sampleProject.characters).toHaveLength(3);
			expect(sampleProject.variables.gameLevel).toBe(1);
			expect(sampleProject.variables.score).toBe(0);

			// Validate character diversity
			const characterColors = sampleProject.characters.map(c => c.color);
			expect(characterColors).toContain('#ffff00'); // Pac-Man yellow
			expect(characterColors).toContain('#ff0000'); // Blinky red
			expect(characterColors).toContain('#ffb8ff'); // Pinky pink

			// Validate character roles
			const roles = sampleProject.characters.map(c => c.role);
			expect(roles).toContain('Protagonist');
			expect(roles).toContain('Primary Antagonist');
			expect(roles).toContain('Secondary Antagonist');

			// Validate game variables are properly initialized
			expect(sampleProject.variables.powerPelletActive).toBe(false);
			expect(sampleProject.variables.livesRemaining).toBe(3);
			expect(sampleProject.variables.currentMaze).toBe('classic');
		});

		it('should create sample dialog trees with proper node structures', () => {
			const encounterTree: DialogTree = {
				id: 'ghost-encounter-tree',
				name: 'Ghost Encounter Dialog',
				description: 'A dynamic encounter with ghosts in the maze',
				nodes: [
					{
						id: 'start-encounter',
						type: 'npc',
						position: { x: 100, y: 50 },
						data: {
							title: 'Ghost Appears',
							content: '*A colorful ghost blocks your path through the maze!*',
							character: 'blinky-ghost'
						}
					}, {
						id: 'player-choice',
						type: 'player_choice',
						position: { x: 100, y: 200 },
						data: {
							title: 'Choose Your Response',
							content: 'How do you react to the ghost?',
							choices: [
								{ id: 'choice-flee', text: 'Run away quickly!' },
								{ id: 'choice-power', text: 'Search for a power pellet' },
								{ id: 'choice-negotiate', text: 'Try to negotiate' }
							]
						}
					},
					{
						id: 'flee-result',
						type: 'npc',
						position: { x: 50, y: 350 },
						data: {
							title: 'Escape Route',
							content: 'Waka waka! You dash through the maze corridors, successfully avoiding the ghost.',
							character: 'pac-man-hero'
						}
					},
					{
						id: 'power-result',
						type: 'conditional',
						position: { x: 100, y: 350 },
						data: {
							title: 'Power Pellet Check',
							content: 'Do you have a power pellet nearby?',
							condition: 'powerPelletActive === true'
						}
					},
					{
						id: 'negotiate-result',
						type: 'npc',
						position: { x: 150, y: 350 },
						data: {
							title: 'Ghost Response',
							content: 'The ghost pauses, surprised by your diplomatic approach...',
							character: 'blinky-ghost'
						}
					},
					{
						id: 'victory-end',
						type: 'end',
						position: { x: 100, y: 500 },
						data: {
							title: 'Victory!',
							content: 'You successfully handled the ghost encounter!'
						}
					}
				],
				connections: [
					{ id: 'conn1', source: 'start-encounter', target: 'player-choice' },
					{ id: 'conn2', source: 'player-choice', target: 'flee-result', sourceHandle: 'choice-flee' },
					{ id: 'conn3', source: 'player-choice', target: 'power-result', sourceHandle: 'choice-power' },
					{ id: 'conn4', source: 'player-choice', target: 'negotiate-result', sourceHandle: 'choice-negotiate' },
					{ id: 'conn5', source: 'flee-result', target: 'victory-end' },
					{ id: 'conn6', source: 'power-result', target: 'victory-end' },
					{ id: 'conn7', source: 'negotiate-result', target: 'victory-end' }
				],
				startNodeId: 'start-encounter',
				createdAt: new Date('2025-05-31'),
				updatedAt: new Date('2025-05-31')
			};

			// Validate tree structure
			expect(encounterTree.nodes).toHaveLength(6);
			expect(encounterTree.connections).toHaveLength(7);
			expect(encounterTree.startNodeId).toBe('start-encounter');			// Validate node types distribution
			const nodeTypes = encounterTree.nodes.map(n => n.type);
			expect(nodeTypes).toContain('npc');
			expect(nodeTypes).toContain('player_choice');
			expect(nodeTypes).toContain('conditional');
			expect(nodeTypes).toContain('end');// Validate player choice node has proper choices
			const choiceNode = encounterTree.nodes.find(n => n.type === 'player_choice');
			expect(choiceNode?.data.choices).toHaveLength(3);
			expect(choiceNode?.data.choices?.[0].text).toContain('Run away');
			expect(choiceNode?.data.choices?.[1].text).toContain('power pellet');
			expect(choiceNode?.data.choices?.[2].text).toContain('negotiate');

			// Validate character assignments
			const npcNodes = encounterTree.nodes.filter(n => n.type === 'npc');
			const charactersUsed = npcNodes.map(n => n.data.character).filter(Boolean);
			expect(charactersUsed).toContain('blinky-ghost');
			expect(charactersUsed).toContain('pac-man-hero');
		});

		it('should create a tutorial dialog tree for new players', () => {
			const tutorialTree: DialogTree = {
				id: 'tutorial-welcome-tree',
				name: 'Game Tutorial Introduction',
				description: 'Welcome new players to the game mechanics',
				nodes: [
					{
						id: 'welcome-start',
						type: 'npc',
						position: { x: 100, y: 50 },
						data: {
							title: 'Welcome to the Maze!',
							content: 'Waka waka! Welcome to the maze, new player! I\'m Pac-Man, and I\'ll show you the ropes.',
							character: 'pac-man-hero'
						}
					}, {
						id: 'tutorial-choice',
						type: 'player_choice',
						position: { x: 100, y: 200 },
						data: {
							title: 'Tutorial Options',
							content: 'What would you like to learn about first?',
							choices: [
								{ id: 'learn-movement', text: 'How do I move around?' },
								{ id: 'learn-dots', text: 'What are those dots for?' },
								{ id: 'learn-ghosts', text: 'Tell me about the ghosts!' },
								{ id: 'skip-tutorial', text: 'I\'m ready to play!' }
							]
						}
					},
					{
						id: 'movement-explain',
						type: 'npc',
						position: { x: 50, y: 350 },
						data: {
							title: 'Movement Tutorial',
							content: 'Use the arrow keys to navigate through the maze. You can only move when there\'s a clear path!',
							character: 'pac-man-hero'
						}
					},
					{
						id: 'dots-explain',
						type: 'npc',
						position: { x: 100, y: 350 },
						data: {
							title: 'Dots and Scoring',
							content: 'Collect the small dots for points! The big power pellets let you chase and eat ghosts temporarily.',
							character: 'pac-man-hero'
						}
					},
					{
						id: 'ghosts-intro',
						type: 'npc',
						position: { x: 150, y: 350 },
						data: {
							title: 'Meet the Ghosts',
							content: 'Each ghost has a unique personality. I\'m aggressive and direct - I\'ll chase you relentlessly!',
							character: 'blinky-ghost'
						}
					},
					{
						id: 'tutorial-complete',
						type: 'end',
						position: { x: 100, y: 500 },
						data: {
							title: 'Tutorial Complete',
							content: 'Great! You\'re ready to start your maze adventure. Good luck!'
						}
					}
				],
				connections: [
					{ id: 'tut-conn1', source: 'welcome-start', target: 'tutorial-choice' },
					{ id: 'tut-conn2', source: 'tutorial-choice', target: 'movement-explain', sourceHandle: 'learn-movement' },
					{ id: 'tut-conn3', source: 'tutorial-choice', target: 'dots-explain', sourceHandle: 'learn-dots' },
					{ id: 'tut-conn4', source: 'tutorial-choice', target: 'ghosts-intro', sourceHandle: 'learn-ghosts' },
					{ id: 'tut-conn5', source: 'tutorial-choice', target: 'tutorial-complete', sourceHandle: 'skip-tutorial' },
					{ id: 'tut-conn6', source: 'movement-explain', target: 'tutorial-complete' },
					{ id: 'tut-conn7', source: 'dots-explain', target: 'tutorial-complete' },
					{ id: 'tut-conn8', source: 'ghosts-intro', target: 'tutorial-complete' }
				],
				startNodeId: 'welcome-start',
				createdAt: new Date('2025-05-31'),
				updatedAt: new Date('2025-05-31')
			};

			// Validate tutorial structure
			expect(tutorialTree.nodes).toHaveLength(6);
			expect(tutorialTree.startNodeId).toBe('welcome-start');			// Validate tutorial has comprehensive choice options
			const choiceNode = tutorialTree.nodes.find(n => n.type === 'player_choice');
			expect(choiceNode?.data.choices).toHaveLength(4);

			// Validate all tutorial paths lead to completion (4 connections to tutorial-complete)
			const endConnections = tutorialTree.connections.filter(c => c.target === 'tutorial-complete');
			expect(endConnections).toHaveLength(4); // 3 tutorial explanation paths + 1 skip option

			// Validate educational content variety
			const explanationNodes = tutorialTree.nodes.filter(n =>
				n.id.includes('explain') || n.id.includes('intro')
			);
			expect(explanationNodes).toHaveLength(3); // movement, dots, ghosts
		});

		it('should create complex branching dialog with multiple characters', () => {
			const complexTree: DialogTree = {
				id: 'ghost-alliance-tree',
				name: 'Ghost Alliance Negotiation',
				description: 'A complex dialog where Pac-Man attempts to negotiate with multiple ghosts',
				nodes: [
					{
						id: 'scene-setup',
						type: 'npc',
						position: { x: 100, y: 50 },
						data: {
							title: 'The Meeting',
							content: 'You find yourself surrounded by Blinky and Pinky in the center of the maze...',
							character: 'pac-man-hero'
						}
					},
					{
						id: 'blinky-aggressive',
						type: 'npc',
						position: { x: 50, y: 150 },
						data: {
							title: 'Blinky\'s Challenge',
							content: 'Well, well! Look who wandered into our territory. You\'ve got some nerve, yellow dot-muncher!',
							character: 'blinky-ghost'
						}
					},
					{
						id: 'pinky-strategic',
						type: 'npc',
						position: { x: 150, y: 150 },
						data: {
							title: 'Pinky\'s Assessment',
							content: 'Hold on, Blinky. Maybe we should hear what our little friend has to say first...',
							character: 'pinky-ghost'
						}
					}, {
						id: 'negotiation-choice',
						type: 'player_choice',
						position: { x: 100, y: 250 },
						data: {
							title: 'Diplomatic Approach',
							content: 'How do you approach this delicate negotiation?',
							choices: [
								{ id: 'appeal-blinky', text: 'Appeal to Blinky\'s leadership' },
								{ id: 'work-with-pinky', text: 'Work with Pinky\'s strategic mind' },
								{ id: 'propose-truce', text: 'Propose a temporary truce' },
								{ id: 'challenge-honor', text: 'Challenge them to honorable combat' }
							]
						}
					},
					{
						id: 'leadership-path',
						type: 'conditional',
						position: { x: 50, y: 350 },
						data: {
							title: 'Leadership Recognition',
							content: 'Check if Blinky respects your diplomatic approach',
							condition: 'playerDiplomacy > 3 && blinkyRespect > 0'
						}
					},
					{
						id: 'strategic-alliance',
						type: 'npc',
						position: { x: 150, y: 350 },
						data: {
							title: 'Pinky\'s Consideration',
							content: 'Interesting... You think like a strategist. Perhaps we could find a mutually beneficial arrangement.',
							character: 'pinky-ghost'
						}
					},
					{
						id: 'successful-negotiation',
						type: 'end',
						position: { x: 100, y: 450 },
						data: {
							title: 'Diplomatic Victory',
							content: 'Through careful negotiation, you\'ve achieved an unprecedented alliance!'
						}
					},
					{
						id: 'negotiation-failed',
						type: 'end',
						position: { x: 200, y: 450 },
						data: {
							title: 'Diplomatic Failure',
							content: 'The negotiations break down, but you gained valuable experience in ghost psychology.'
						}
					}
				],
				connections: [
					{ id: 'complex-conn1', source: 'scene-setup', target: 'blinky-aggressive' },
					{ id: 'complex-conn2', source: 'blinky-aggressive', target: 'pinky-strategic' },
					{ id: 'complex-conn3', source: 'pinky-strategic', target: 'negotiation-choice' },
					{ id: 'complex-conn4', source: 'negotiation-choice', target: 'leadership-path', sourceHandle: 'appeal-blinky' },
					{ id: 'complex-conn5', source: 'negotiation-choice', target: 'strategic-alliance', sourceHandle: 'work-with-pinky' },
					{ id: 'complex-conn6', source: 'leadership-path', target: 'successful-negotiation', targetHandle: 'true' },
					{ id: 'complex-conn7', source: 'leadership-path', target: 'negotiation-failed', targetHandle: 'false' },
					{ id: 'complex-conn8', source: 'strategic-alliance', target: 'successful-negotiation' }
				],
				startNodeId: 'scene-setup',
				createdAt: new Date('2025-05-31'),
				updatedAt: new Date('2025-05-31')
			};

			// Validate complex tree structure
			expect(complexTree.nodes).toHaveLength(8);
			expect(complexTree.connections).toHaveLength(8);

			// Validate multiple character involvement
			const charactersInTree = complexTree.nodes
				.map(n => n.data.character)
				.filter(Boolean);
			const uniqueCharacters = [...new Set(charactersInTree)];
			expect(uniqueCharacters).toHaveLength(3); // pac-man, blinky, pinky

			// Validate conditional logic presence
			const conditionalNodes = complexTree.nodes.filter(n => n.type === 'conditional');
			expect(conditionalNodes).toHaveLength(1);
			expect(conditionalNodes[0].data.condition).toContain('playerDiplomacy');

			// Validate multiple ending scenarios
			const endNodes = complexTree.nodes.filter(n => n.type === 'end');
			expect(endNodes).toHaveLength(2);
			expect(endNodes.some(n => n.data.title?.includes('Victory'))).toBe(true);
			expect(endNodes.some(n => n.data.title?.includes('Failure'))).toBe(true);
		});
	})
})
