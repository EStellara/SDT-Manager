import { useDialogProject } from "@/contexts/DialogProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileText, Package } from "lucide-react";
import { useState } from "react";
import type { DialogProject, DialogTree } from "@/types/dialog";

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
				id: crypto.randomUUID(), // Generate new ID to avoid conflicts
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Import associated characters
			if (treeData.characters && Array.isArray(treeData.characters)) {
				treeData.characters.forEach((char: any) => {
					const existingChar = state.currentProject?.characters.find((c) => c.name === char.name);
					if (!existingChar) {
						const newChar = {
							...char,
							id: crypto.randomUUID(),
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

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

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
						</div>

						<div className="grid grid-cols-2 gap-4">
							<Button
								onClick={exportProject}
								disabled={!state.currentProject}
								className="h-auto p-4 flex flex-col items-center gap-2"
							>
								<Download className="w-6 h-6" />
								<div className="text-center">
									<div className="font-medium">Export Entire Project</div>
									<div className="text-xs text-muted-foreground">
										All trees, characters, and settings
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

						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="file-upload">Upload File</Label>
								<Input
									id="file-upload"
									type="file"
									accept=".json"
									onChange={handleFileUpload}
									className="cursor-pointer"
								/>
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
							</div>

							<div className="grid grid-cols-2 gap-4">
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
