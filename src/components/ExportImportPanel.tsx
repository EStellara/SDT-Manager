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

	if (!isOpen) return null;

	const exportProject = () => {
		if (!state.currentProject) return;

		const dataStr = JSON.stringify(state.currentProject, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);

		const link = document.createElement("a");
		link.href = url;
		link.download = `${state.currentProject.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_project.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
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
			const projectData: DialogProject = JSON.parse(importData);

			// Validate the structure
			if (!projectData.id || !projectData.name || !projectData.dialogTrees) {
				throw new Error("Invalid project format");
			}

			dispatch({ type: "LOAD_PROJECT", payload: projectData });
			setImportData("");
			onClose();
		} catch (error) {
			alert("Error importing project: " + (error as Error).message);
		}
	};

	const importTree = () => {
		try {
			const treeData = JSON.parse(importData);

			// Validate tree export format
			if (!treeData.tree || !treeData.tree.id || !treeData.tree.name) {
				throw new Error("Invalid tree export format");
			}

			if (!state.currentProject) {
				alert("Please create or load a project first");
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
			onClose();
		} catch (error) {
			alert("Error importing tree: " + (error as Error).message);
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
					{/* Export Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Export</h3>

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
					</div>

					{/* Import Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Import</h3>

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
