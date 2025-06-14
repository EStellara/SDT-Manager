import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";
import type { DialogProject, DialogTree } from "@/types/dialog";

/**
 * Opens a file picker dialog and returns the selected file
 */
export function openFilePicker(accept: string = ".json,.zip"): Promise<File | null> {
	return new Promise((resolve) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = accept;
		input.multiple = false;

		input.onchange = (event) => {
			const file = (event.target as HTMLInputElement).files?.[0] || null;
			resolve(file);
		};

		input.oncancel = () => {
			resolve(null);
		};

		// Trigger the file picker
		input.click();
	});
}

/**
 * Opens a file picker for multiple files
 */
export function openMultipleFilePicker(accept: string = ".json"): Promise<FileList | null> {
	return new Promise((resolve) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = accept;
		input.multiple = true;

		input.onchange = (event) => {
			const files = (event.target as HTMLInputElement).files;
			resolve(files);
		};

		input.oncancel = () => {
			resolve(null);
		};

		// Trigger the file picker
		input.click();
	});
}

/**
 * Reads the content of a file as text
 */
export function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target?.result as string);
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsText(file);
	});
}

/**
 * Imports a project from a ZIP file
 */
export async function importProjectFromZip(file: File): Promise<DialogProject> {
	const zip = new JSZip();
	const zipContent = await zip.loadAsync(file);

	// Check if this is a valid project zip
	const projectFile = zipContent.file("project.json");
	if (!projectFile) {
		throw new Error("Invalid project zip: missing project.json");
	}

	const projectMetadata = JSON.parse(await projectFile.async("text"));

	// Load characters
	let characters: any[] = [];
	const charactersFile = zipContent.file("characters.json");
	if (charactersFile) {
		characters = JSON.parse(await charactersFile.async("text"));
	}

	// Load variables
	let variables: Record<string, any> = {};
	const variablesFile = zipContent.file("variables.json");
	if (variablesFile) {
		variables = JSON.parse(await variablesFile.async("text"));
	}

	// Load all dialog trees from the trees folder
	const dialogTrees: DialogTree[] = [];
	const treeFiles = Object.keys(zipContent.files).filter(
		(fileName) => fileName.startsWith("trees/") && fileName.endsWith(".json")
	);

	for (const treeFileName of treeFiles) {
		const treeFile = zipContent.file(treeFileName);
		if (treeFile) {
			const treeData = JSON.parse(await treeFile.async("text"));
			if (treeData.tree) {
				// Update tree with new IDs to avoid conflicts
				const tree: DialogTree = {
					...treeData.tree,
					id: uuidv4(),
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				dialogTrees.push(tree);

				// Import any related characters that don't already exist
				if (treeData.relatedCharacters && Array.isArray(treeData.relatedCharacters)) {
					for (const char of treeData.relatedCharacters) {
						const existingChar = characters.find((c) => c.name === char.name);
						if (!existingChar) {
							characters.push({
								...char,
								id: uuidv4(),
								createdAt: new Date(),
								updatedAt: new Date(),
							});
						}
					}
				}
			}
		}
	}

	// Create the complete project
	const fullProject: DialogProject = {
		id: uuidv4(),
		name: projectMetadata.name,
		description: projectMetadata.description,
		characters,
		dialogTrees,
		variables,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return fullProject;
}

/**
 * Imports a project from a JSON file
 */
export async function importProjectFromJSON(file: File): Promise<DialogProject> {
	const content = await readFileAsText(file);
	const projectData: DialogProject = JSON.parse(content);

	// Enhanced validation
	if (!projectData.id || !projectData.name || !projectData.dialogTrees) {
		throw new Error("Invalid project format - missing required fields");
	}

	if (!Array.isArray(projectData.dialogTrees)) {
		throw new Error("Invalid project format - dialogTrees must be an array");
	}

	if (!Array.isArray(projectData.characters)) {
		throw new Error("Invalid project format - characters must be an array");
	}

	// Validate each dialog tree
	projectData.dialogTrees.forEach((tree, index) => {
		if (!tree.id || !tree.name || !Array.isArray(tree.nodes)) {
			throw new Error(`Invalid dialog tree at index ${index}`);
		}
	});

	// Return the project with updated timestamps
	return {
		...projectData,
		id: uuidv4(), // Generate new ID to avoid conflicts
		createdAt: new Date(),
		updatedAt: new Date(),
		dialogTrees: projectData.dialogTrees.map(tree => ({
			...tree,
			id: uuidv4(),
			createdAt: new Date(),
			updatedAt: new Date(),
		})),
		characters: projectData.characters.map(char => ({
			...char,
			id: uuidv4(),
			createdAt: new Date(),
			updatedAt: new Date(),
		}))
	};
}

/**
 * Automatically detects file type and imports the project
 */
export async function importProject(file: File): Promise<DialogProject> {
	const isZip = file.name.endsWith(".zip") || file.type === "application/zip";

	if (isZip) {
		return await importProjectFromZip(file);
	} else {
		return await importProjectFromJSON(file);
	}
}
