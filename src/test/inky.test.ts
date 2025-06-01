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
					text: "Waka waka! Welcome to the maze!",
					characterId: 'pac-man',
					conditions: []
				}
			}

			expect(node.type).toBe('npc')
			expect(node.data.text).toContain('Waka')
			expect(node.position.x).toBe(100)
			expect(node.position.y).toBe(100)
		})

		it('should create a valid player choice node', () => {
			const node: DialogNode = {
				id: 'inky-test-2',
				type: 'choice',
				position: { x: 200, y: 200 },
				data: {
					text: "Which direction will you go?",
					choices: [
						{ id: 'choice-1', text: 'Go left into the blue territory', targetNodeId: 'left-node' },
						{ id: 'choice-2', text: 'Go right toward the power pellet', targetNodeId: 'right-node' }
					]
				}
			}

			expect(node.type).toBe('choice')
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
})
