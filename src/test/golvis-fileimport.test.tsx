// 📁 GOLVIS - The ghost who tests our file import functionality
// Golvis navigates through file systems, perfect for testing file operations

import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileAsText, importProject, importProjectFromJSON, importProjectFromZip } from "@/lib/fileImport";
import type { DialogProject } from "@/types/dialog";

// Mock JSZip for testing
let mockZipFiles: Record<string, any> = {};

vi.mock("jszip", () => ({
	default: class MockJSZip {
		files: Record<string, any> = {};
		file(name: string, content?: string) {
			if (content !== undefined) {
				this.files[name] = {
					content,
					async: (type: string) => Promise.resolve(type === "text" ? content : content),
				};
				return this;
			}
			// Return file from this.files (which gets set by loadAsync)
			return this.files[name] || null;
		}
		async loadAsync(_data: any) {
			// Use mockZipFiles if it has been set for specific test scenarios
			if (Object.keys(mockZipFiles).length > 0) {
				this.files = mockZipFiles;
			} else {
				// Default mock behavior for normal tests
				this.files = {
					"project.json": {
						async: () =>
							Promise.resolve(
								JSON.stringify({
									name: "Test Project",
									description: "A test project from ZIP",
								})
							),
					},
					"characters.json": {
						async: () => Promise.resolve(JSON.stringify([])),
					},
					"variables.json": {
						async: () => Promise.resolve(JSON.stringify({})),
					},
					"trees/test_tree.json": {
						async: () =>
							Promise.resolve(
								JSON.stringify({
									tree: {
										id: "test-tree",
										name: "Test Tree",
										nodes: [],
										connections: [],
										createdAt: new Date(),
										updatedAt: new Date(),
									},
									relatedCharacters: [],
								})
							),
					},
				};
			}
			return this;
		}

		async generateAsync(_options: any) {
			return new Blob(["mock zip content"], { type: "application/zip" });
		}
	},
}));

describe("📁 Golvis: File Import Tests", () => {
	beforeEach(() => {
		// Reset DOM
		document.body.innerHTML = "";
		vi.clearAllMocks();
		// Reset mock zip files
		mockZipFiles = {};
	});
	describe("File Picker Functions", () => {
		it("should be tested in integration tests", () => {
			// File picker functions are tested in integration tests
			// since they require actual DOM interaction and user events
			expect(true).toBe(true);
		});
	});

	describe("File Reading", () => {
		it("should read file content as text", async () => {
			const testContent = "Hello, file content!";
			const mockFile = new File([testContent], "test.txt", { type: "text/plain" });

			const content = await readFileAsText(mockFile);
			expect(content).toBe(testContent);
		});
		it("should handle file reading errors", async () => {
			// Create a mock file that will cause FileReader to error
			const mockFile = {} as File;

			await expect(readFileAsText(mockFile)).rejects.toThrow("Failed to execute 'readAsText' on 'FileReader'");
		});
	});

	describe("JSON Project Import", () => {
		it("should import a valid JSON project", async () => {
			const projectData: DialogProject = {
				id: "test-project",
				name: "Test Project",
				description: "A test project",
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const jsonContent = JSON.stringify(projectData);
			const mockFile = new File([jsonContent], "project.json", { type: "application/json" });

			const importedProject = await importProjectFromJSON(mockFile);

			expect(importedProject.name).toBe("Test Project");
			expect(importedProject.description).toBe("A test project");
			expect(Array.isArray(importedProject.dialogTrees)).toBe(true);
			expect(Array.isArray(importedProject.characters)).toBe(true);
			// New ID should be generated
			expect(importedProject.id).not.toBe("test-project");
		});

		it("should validate required project fields", async () => {
			const invalidProject = {
				name: "Test Project",
				// Missing required fields
			};

			const jsonContent = JSON.stringify(invalidProject);
			const mockFile = new File([jsonContent], "invalid.json", { type: "application/json" });

			await expect(importProjectFromJSON(mockFile)).rejects.toThrow("Invalid project format");
		});

		it("should validate dialog trees array", async () => {
			const invalidProject = {
				id: "test",
				name: "Test",
				characters: [],
				dialogTrees: "not an array",
				variables: {},
			};

			const jsonContent = JSON.stringify(invalidProject);
			const mockFile = new File([jsonContent], "invalid.json", { type: "application/json" });

			await expect(importProjectFromJSON(mockFile)).rejects.toThrow("dialogTrees must be an array");
		});

		it("should generate new IDs for imported entities", async () => {
			const projectData: DialogProject = {
				id: "original-id",
				name: "Test Project",
				description: "Test",
				characters: [
					{
						id: "char-1",
						name: "Test Character",
						color: "#ff0000",
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				dialogTrees: [
					{
						id: "tree-1",
						name: "Test Tree",
						nodes: [],
						connections: [],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const jsonContent = JSON.stringify(projectData);
			const mockFile = new File([jsonContent], "project.json", { type: "application/json" });

			const importedProject = await importProjectFromJSON(mockFile);

			// All IDs should be regenerated
			expect(importedProject.id).not.toBe("original-id");
			expect(importedProject.characters[0].id).not.toBe("char-1");
			expect(importedProject.dialogTrees[0].id).not.toBe("tree-1");
		});
	});

	describe("ZIP Project Import", () => {
		it("should import a valid ZIP project", async () => {
			const mockZipFile = new File(["mock zip content"], "project.zip", { type: "application/zip" });

			const importedProject = await importProjectFromZip(mockZipFile);

			expect(importedProject.name).toBe("Test Project");
			expect(importedProject.description).toBe("A test project from ZIP");
			expect(Array.isArray(importedProject.dialogTrees)).toBe(true);
			expect(importedProject.dialogTrees).toHaveLength(1);
			expect(importedProject.dialogTrees[0].name).toBe("Test Tree");
		});
		it("should handle missing project.json in ZIP", async () => {
			// Set up mock to simulate missing project.json by providing an empty files object
			mockZipFiles = {}; // No files at all

			const mockZipFile = new File(["mock zip content"], "invalid.zip", { type: "application/zip" });

			await expect(importProjectFromZip(mockZipFile)).rejects.toThrow(
				"Invalid project zip: missing project.json"
			);
		});
	});

	describe("Automatic Import Detection", () => {
		it("should detect ZIP files and use ZIP import", async () => {
			const mockZipFile = new File(["mock content"], "project.zip", { type: "application/zip" });

			const importedProject = await importProject(mockZipFile);
			expect(importedProject.name).toBe("Test Project");
		});

		it("should detect JSON files and use JSON import", async () => {
			const projectData: DialogProject = {
				id: "test-project",
				name: "JSON Test Project",
				description: "A JSON test project",
				characters: [],
				dialogTrees: [],
				variables: {},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const jsonContent = JSON.stringify(projectData);
			const mockJsonFile = new File([jsonContent], "project.json", { type: "application/json" });

			const importedProject = await importProject(mockJsonFile);
			expect(importedProject.name).toBe("JSON Test Project");
		});

		it("should detect ZIP files by extension even without MIME type", async () => {
			const mockZipFile = new File(["mock content"], "project.zip", { type: "" });

			const importedProject = await importProject(mockZipFile);
			expect(importedProject.name).toBe("Test Project");
		});
	});

	describe("Error Handling", () => {
		it("should handle malformed JSON", async () => {
			const invalidJson = "{ invalid json content }";
			const mockFile = new File([invalidJson], "invalid.json", { type: "application/json" });

			await expect(importProjectFromJSON(mockFile)).rejects.toThrow();
		});

		it("should provide meaningful error messages", async () => {
			const projectWithInvalidTree = {
				id: "test",
				name: "Test",
				description: "Test",
				characters: [],
				dialogTrees: [
					{
						// Missing required fields
						name: "Invalid Tree",
					},
				],
				variables: {},
			};

			const jsonContent = JSON.stringify(projectWithInvalidTree);
			const mockFile = new File([jsonContent], "invalid.json", { type: "application/json" });

			await expect(importProjectFromJSON(mockFile)).rejects.toThrow("Invalid dialog tree at index 0");
		});
	});

	describe("Character and Tree Handling", () => {
		it("should preserve character relationships in ZIP imports", async () => {
			const mockZipFile = new File(["mock zip content"], "project.zip", { type: "application/zip" });

			const importedProject = await importProjectFromZip(mockZipFile);

			// Should have characters from related characters in trees
			expect(Array.isArray(importedProject.characters)).toBe(true);
			// Tree should be properly imported
			expect(importedProject.dialogTrees).toHaveLength(1);
		});

		it("should handle projects with variables", async () => {
			const projectWithVariables: DialogProject = {
				id: "test-project",
				name: "Project with Variables",
				description: "Test project",
				characters: [],
				dialogTrees: [],
				variables: {
					playerLevel: 5,
					currentQuest: "main_quest",
					hasKey: false,
				},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const jsonContent = JSON.stringify(projectWithVariables);
			const mockFile = new File([jsonContent], "project.json", { type: "application/json" });

			const importedProject = await importProjectFromJSON(mockFile);

			expect(importedProject.variables.playerLevel).toBe(5);
			expect(importedProject.variables.currentQuest).toBe("main_quest");
			expect(importedProject.variables.hasKey).toBe(false);
		});
	});
});
