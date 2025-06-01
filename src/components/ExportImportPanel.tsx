import { useDialogProject } from "@/contexts/DialogProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileText, Package, Archive } from "lucide-react";
import { useState } from "react";
import type { DialogProject, DialogTree } from "@/types/dialog";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";

interface ExportImportPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

export function ExportImportPanel({ isOpen, onClose }: ExportImportPanelProps) {
	const { state, dispatch } = useDialogProject();
	const [importData, setImportData] = useState("");
	const [exportFormat, setExportFormat] = useState<"json" | "yaml" | "xml">("json");
	const [importError, setImportError] = useState<string | null>(null);
	const [exportSuccess, setExportSuccess] = useState<string | null>(null);

	if (!isOpen) return null;

	const exportProjectAsZip = async () => {
		if (!state.currentProject) return;

		try {
			const zip = new JSZip();
			const projectName = state.currentProject.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();

			// Create project metadata file
			const projectMetadata = {
				id: state.currentProject.id,
				name: state.currentProject.name,
				description: state.currentProject.description,
				version: "1.0",
				exportedAt: new Date().toISOString(),
				treeCount: state.currentProject.dialogTrees.length,
				characterCount: state.currentProject.characters.length,
			};
			zip.file("project.json", JSON.stringify(projectMetadata, null, 2));

			// Create characters file
			if (state.currentProject.characters.length > 0) {
				zip.file("characters.json", JSON.stringify(state.currentProject.characters, null, 2));
			}

			// Create individual JSON files for each dialog tree
			for (const tree of state.currentProject.dialogTrees) {
				const treeData = {
					tree,
					relatedCharacters: state.currentProject.characters.filter((char) =>
						tree.nodes.some((node) => node.data.character === char.id)
					),
					exportedAt: new Date().toISOString(),
					exportVersion: "1.0",
				};

				const fileName = `trees/${tree.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
				zip.file(fileName, JSON.stringify(treeData, null, 2));
			}

			// Create project variables file if any exist
			if (Object.keys(state.currentProject.variables).length > 0) {
				zip.file("variables.json", JSON.stringify(state.currentProject.variables, null, 2));
			}

			// Generate and download the zip file
			const zipBlob = await zip.generateAsync({ type: "blob" });
			const url = URL.createObjectURL(zipBlob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `${projectName}_project.zip`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			setExportSuccess(`Project exported as ${projectName}_project.zip with individual tree files`);
			setTimeout(() => setExportSuccess(null), 3000);
		} catch (error) {
			console.error("Export failed:", error);
			setImportError("Failed to export project as zip");
			setTimeout(() => setImportError(null), 3000);
		}
	};

	const exportProject = () => {
		if (!state.currentProject) return;

		try {
			let dataStr: string;
			let fileName: string;
			let mimeType: string;

			const projectName = state.currentProject.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();

			switch (exportFormat) {
				case "json":
					dataStr = JSON.stringify(state.currentProject, null, 2);
					fileName = `${projectName}_project.json`;
					mimeType = "application/json";
					break;
				case "yaml":
					// Simple YAML export (in a real app, you'd use a YAML library)
					dataStr =
						`# Dialog Project: ${state.currentProject.name}\n` +
						`name: "${state.currentProject.name}"\n` +
						`description: "${state.currentProject.description || ""}"\n` +
						`created: ${state.currentProject.createdAt.toISOString()}\n` +
						`trees: ${state.currentProject.dialogTrees.length}\n` +
						`characters: ${state.currentProject.characters.length}\n` +
						`\n# Note: This is a simplified YAML export for reference only`;
					fileName = `${projectName}_project.yaml`;
					mimeType = "text/yaml";
					break;
				case "xml":
					// Simple XML export
					dataStr =
						`<?xml version="1.0" encoding="UTF-8"?>\n` +
						`<dialogProject>\n` +
						`  <name>${state.currentProject.name}</name>\n` +
						`  <description>${state.currentProject.description || ""}</description>\n` +
						`  <trees count="${state.currentProject.dialogTrees.length}" />\n` +
						`  <characters count="${state.currentProject.characters.length}" />\n` +
						`  <!-- Full project data: ${JSON.stringify(state.currentProject)
							.replace(/</g, "&lt;")
							.replace(/>/g, "&gt;")} -->\n` +
						`</dialogProject>`;
					fileName = `${projectName}_project.xml`;
					mimeType = "application/xml";
					break;
			}

			const dataBlob = new Blob([dataStr], { type: mimeType });
			const url = URL.createObjectURL(dataBlob);

			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			setExportSuccess(`Project exported as ${fileName}`);
			setTimeout(() => setExportSuccess(null), 3000);
		} catch (error) {
			console.error("Export failed:", error);
			setImportError("Failed to export project");
			setTimeout(() => setImportError(null), 3000);
		}
	};

	const exportCurrentTree = () => {
		const currentTree = state.currentProject?.dialogTrees.find((tree) => tree.id === state.selectedTreeId);

		if (!currentTree) return;

		const exportData = {
			tree: currentTree,
			characters:
				state.currentProject?.characters.filter((char) =>
					currentTree.nodes.some((node) => node.data.character === char.id)
				) || [],
			exportedAt: new Date().toISOString(),
			exportVersion: "1.0",
		};

		const dataStr = JSON.stringify(exportData, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);

		const link = document.createElement("a");
		link.href = url;
		link.download = `${currentTree.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_tree.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};
	const importProject = () => {
		try {
			setImportError(null);
			const projectData: DialogProject = JSON.parse(importData);

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

			dispatch({ type: "LOAD_PROJECT", payload: projectData });
			setImportData("");
			setExportSuccess("Project imported successfully!");
			setTimeout(() => setExportSuccess(null), 3000);
			onClose();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			setImportError("Error importing project: " + errorMessage);
			setTimeout(() => setImportError(null), 5000);
		}
	};
	const importTree = () => {
		try {
			setImportError(null);
			const treeData = JSON.parse(importData);

			// Enhanced validation for tree export format
			if (!treeData.tree || !treeData.tree.id || !treeData.tree.name) {
				throw new Error("Invalid tree export format - missing tree data");
			}

			if (!Array.isArray(treeData.tree.nodes)) {
				throw new Error("Invalid tree format - nodes must be an array");
			}

			if (!state.currentProject) {
				setImportError("Please create or load a project first");
				setTimeout(() => setImportError(null), 3000);
				return;
			}

			const tree: DialogTree = {
				...treeData.tree,
				id: uuidv4(), // Generate new ID to avoid conflicts
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Import associated characters
			if (treeData.characters && Array.isArray(treeData.characters)) {
				treeData.characters.forEach((char: any) => {
					const existingChar = state.currentProject?.characters.find((c) => c.name === char.name);
					if (!existingChar) {					const newChar = {
							...char,
							id: uuidv4(),
							createdAt: new Date(),
							updatedAt: new Date(),
						};
						dispatch({ type: "ADD_CHARACTER", payload: newChar });
					}
				});
			}

			// Add the tree
			dispatch({
				type: "UPDATE_PROJECT",
				payload: {
					dialogTrees: [...(state.currentProject.dialogTrees || []), tree],
					updatedAt: new Date(),
				},
			});

			setImportData("");
			setExportSuccess("Dialog tree imported successfully!");
			setTimeout(() => setExportSuccess(null), 3000);
			onClose();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			setImportError("Error importing tree: " + errorMessage);
			setTimeout(() => setImportError(null), 5000);
		}
	};

	const importProjectFromZip = async (file: File) => {
		try {
			setImportError(null);
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
			const treeFiles = Object.keys(zipContent.files).filter(fileName => 
				fileName.startsWith("trees/") && fileName.endsWith(".json")
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
								const existingChar = characters.find(c => c.name === char.name);
								if (!existingChar) {									characters.push({
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
			}			// Create the complete project
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

			dispatch({ type: "LOAD_PROJECT", payload: fullProject });
			setExportSuccess(`Project imported successfully! Loaded ${dialogTrees.length} dialog trees and ${characters.length} characters.`);
			setTimeout(() => setExportSuccess(null), 4000);
			onClose();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			setImportError("Error importing project zip: " + errorMessage);
			setTimeout(() => setImportError(null), 5000);
		}
	};
	const handleMultipleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		try {
			setImportError(null);
			const dialogTrees: DialogTree[] = [];
			const allCharacters: any[] = [];

			// Process each file
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (!file.name.endsWith('.json')) continue;

				const content = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = (e) => resolve(e.target?.result as string);
					reader.onerror = reject;
					reader.readAsText(file);
				});

				try {
					const data = JSON.parse(content);
							// Check if this is a tree export format
					if (data.tree && data.tree.id && data.tree.name) {
						const tree: DialogTree = {
							...data.tree,
							id: uuidv4(),
							createdAt: new Date(),
							updatedAt: new Date(),
						};
						dialogTrees.push(tree);

						// Collect characters from this tree
						if (data.relatedCharacters && Array.isArray(data.relatedCharacters)) {
							for (const char of data.relatedCharacters) {
								const existingChar = allCharacters.find(c => c.name === char.name);								if (!existingChar) {
									allCharacters.push({
										...char,
										id: uuidv4(),
										createdAt: new Date(),
										updatedAt: new Date(),
									});
								}
							}
						}
					}
				} catch (parseError) {
					console.warn(`Failed to parse file ${file.name}:`, parseError);
				}
			}

			if (dialogTrees.length === 0) {
				throw new Error("No valid dialog tree files found");
			}			// If no current project, create a new one
			if (!state.currentProject) {
				const newProject: DialogProject = {
					id: uuidv4(),
					name: "Imported Project",
					description: `Project created from ${dialogTrees.length} imported trees`,
					characters: allCharacters,
					dialogTrees,
					variables: {},
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				dispatch({ type: "LOAD_PROJECT", payload: newProject });
			} else {
				// Add to existing project
				for (const char of allCharacters) {
					const existingChar = state.currentProject.characters.find(c => c.name === char.name);
					if (!existingChar) {
						dispatch({ type: "ADD_CHARACTER", payload: char });
					}
				}

				for (const tree of dialogTrees) {
					dispatch({
						type: "UPDATE_PROJECT",
						payload: {
							dialogTrees: [...state.currentProject.dialogTrees, tree],
							updatedAt: new Date(),
						},
					});
				}
			}

			setExportSuccess(`Successfully imported ${dialogTrees.length} dialog trees and ${allCharacters.length} characters!`);
			setTimeout(() => setExportSuccess(null), 4000);
			onClose();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			setImportError("Error importing files: " + errorMessage);
			setTimeout(() => setImportError(null), 5000);
		}
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Check if it's a zip file
		if (file.name.endsWith('.zip') || file.type === 'application/zip') {
			importProjectFromZip(file);
			return;
		}

		// Handle regular JSON files
		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			setImportData(content);
		};
		reader.readAsText(file);
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Package className="w-5 h-5" />
						Export / Import
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-6">
					{" "}
					{/* Export Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Export</h3>

						{/* Export format selector */}
						<div className="space-y-2">
							<Label>Export Format</Label>
							<div className="flex gap-2">
								<Button
									type="button"
									variant={exportFormat === "json" ? "default" : "outline"}
									size="sm"
									onClick={() => setExportFormat("json")}
								>
									JSON
								</Button>
								<Button
									type="button"
									variant={exportFormat === "yaml" ? "default" : "outline"}
									size="sm"
									onClick={() => setExportFormat("yaml")}
								>
									YAML
								</Button>
								<Button
									type="button"
									variant={exportFormat === "xml" ? "default" : "outline"}
									size="sm"
									onClick={() => setExportFormat("xml")}
								>
									XML
								</Button>
							</div>
						</div>						<div className="grid grid-cols-1 gap-4">
							<Button
								onClick={exportProject}
								disabled={!state.currentProject}
								className="h-auto p-4 flex flex-col items-center gap-2"
							>
								<Download className="w-6 h-6" />
								<div className="text-center">
									<div className="font-medium">Export Project (Single File)</div>
									<div className="text-xs text-muted-foreground">
										All trees and characters in one file
									</div>
								</div>
							</Button>

							<Button
								onClick={exportProjectAsZip}
								disabled={!state.currentProject}
								variant="outline"
								className="h-auto p-4 flex flex-col items-center gap-2"
							>
								<Archive className="w-6 h-6" />
								<div className="text-center">
									<div className="font-medium">Export Project (Structured)</div>
									<div className="text-xs text-muted-foreground">
										Separate JSON files for each tree in a zip
									</div>
								</div>
							</Button>

							<Button
								onClick={exportCurrentTree}
								disabled={!state.selectedTreeId}
								variant="outline"
								className="h-auto p-4 flex flex-col items-center gap-2"
							>
								<FileText className="w-6 h-6" />
								<div className="text-center">
									<div className="font-medium">Export Current Tree</div>
									<div className="text-xs text-muted-foreground">Tree with associated characters</div>
								</div>
							</Button>
						</div>
					</div>{" "}
					{/* Import Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Import</h3>

						{/* Error/Success Messages */}
						{importError && (
							<div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
								{importError}
							</div>
						)}
						{exportSuccess && (
							<div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded text-sm">
								{exportSuccess}
							</div>
						)}

						<div className="space-y-4">							<div className="space-y-2">
								<Label htmlFor="file-upload">Upload File</Label>
								<Input
									id="file-upload"
									type="file"
									accept=".json,.zip"
									onChange={handleFileUpload}
									className="cursor-pointer"
								/>
								<p className="text-xs text-muted-foreground">
									Supports .json files (single project/tree) and .zip files (structured projects)
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="multiple-file-upload">Upload Multiple Tree Files</Label>
								<Input
									id="multiple-file-upload"
									type="file"
									accept=".json"
									multiple
									onChange={handleMultipleFileUpload}
									className="cursor-pointer"
								/>
								<p className="text-xs text-muted-foreground">
									Upload multiple dialog tree JSON files at once
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="import-data">Or Paste JSON Data</Label>
								<textarea
									id="import-data"
									value={importData}
									onChange={(e) => setImportData(e.target.value)}
									placeholder="Paste exported JSON data here..."
									className="w-full h-32 p-3 text-sm border border-input bg-background rounded-md resize-none"
								/>
							</div>							<div className="grid grid-cols-1 gap-4">
								<Button
									onClick={importProject}
									disabled={!importData.trim()}
									className="h-auto p-4 flex flex-col items-center gap-2"
								>
									<Upload className="w-6 h-6" />
									<div className="text-center">
										<div className="font-medium">Import Project</div>
										<div className="text-xs text-muted-foreground">Replace current project</div>
									</div>
								</Button>

								<Button
									onClick={importTree}
									disabled={!importData.trim() || !state.currentProject}
									variant="outline"
									className="h-auto p-4 flex flex-col items-center gap-2"
								>
									<Upload className="w-6 h-6" />
									<div className="text-center">
										<div className="font-medium">Import Tree</div>
										<div className="text-xs text-muted-foreground">Add to current project</div>
									</div>
								</Button>
							</div>
						</div>
					</div>
					{/* Actions */}
					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button variant="outline" onClick={onClose}>
							Close
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
