import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDialogProject } from "@/contexts/DialogProjectContext";
import { FolderPlus, FilePlus, Folder, FileText, Users, Plus } from "lucide-react";

export function ProjectSidebar() {
	const { state, createProject, createTree, selectTree, dispatch } = useDialogProject();
	const [newProjectName, setNewProjectName] = useState("");
	const [newTreeName, setNewTreeName] = useState("");
	const [showNewProject, setShowNewProject] = useState(false);
	const [showNewTree, setShowNewTree] = useState(false);

	const handleCreateProject = () => {
		if (newProjectName.trim()) {
			createProject(newProjectName.trim());
			setNewProjectName("");
			setShowNewProject(false);
		}
	};

	const handleCreateTree = () => {
		if (newTreeName.trim()) {
			createTree(newTreeName.trim());
			setNewTreeName("");
			setShowNewTree(false);
		}
	};

	const addCharacter = () => {
		if (!state.currentProject) return;

		const newCharacter = {
			id: Math.random().toString(36).substr(2, 9),
			name: "New Character",
			color: "#3b82f6",
		};

		dispatch({ type: "ADD_CHARACTER", payload: newCharacter });
	};

	return (
		<div className="w-80 h-full bg-background border-r border-border flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-border">
				<h2 className="text-lg font-semibold mb-3">Dialog Tree Manager</h2>

				{/* New Project */}
				{!state.currentProject ? (
					<div className="space-y-2">
						{showNewProject ? (
							<div className="space-y-2">
								{" "}
								<Input
									placeholder="Project name"
									value={newProjectName}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setNewProjectName(e.target.value)
									}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
										e.key === "Enter" && handleCreateProject()
									}
								/>
								<div className="flex gap-2">
									<Button size="sm" onClick={handleCreateProject}>
										Create
									</Button>
									<Button size="sm" variant="outline" onClick={() => setShowNewProject(false)}>
										Cancel
									</Button>
								</div>
							</div>
						) : (
							<Button onClick={() => setShowNewProject(true)} className="w-full" variant="outline">
								<FolderPlus className="w-4 h-4 mr-2" />
								New Project
							</Button>
						)}
					</div>
				) : (
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Folder className="w-4 h-4" />
							<span className="font-medium">{state.currentProject.name}</span>
						</div>
						{state.currentProject.description && (
							<p className="text-sm text-muted-foreground">{state.currentProject.description}</p>
						)}
					</div>
				)}
			</div>

			{/* Content */}
			{state.currentProject && (
				<div className="flex-1 overflow-y-auto">
					{/* Dialog Trees */}
					<div className="p-4">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-medium">Dialog Trees</h3>
							{showNewTree ? (
								<div className="flex-1 ml-2">
									{" "}
									<Input
										placeholder="Tree name"
										value={newTreeName}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setNewTreeName(e.target.value)
										}
										onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
											if (e.key === "Enter") handleCreateTree();
											if (e.key === "Escape") setShowNewTree(false);
										}}
										className="text-xs"
										autoFocus
									/>
								</div>
							) : (
								<Button size="sm" variant="ghost" onClick={() => setShowNewTree(true)}>
									<FilePlus className="w-3 h-3" />
								</Button>
							)}
						</div>

						<div className="space-y-1">
							{state.currentProject.dialogTrees.map((tree) => (
								<div
									key={tree.id}
									className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-secondary/50 ${
										state.selectedTreeId === tree.id ? "bg-secondary" : ""
									}`}
									onClick={() => selectTree(tree.id)}
								>
									<FileText className="w-4 h-4 text-muted-foreground" />
									<span className="flex-1 text-sm">{tree.name}</span>
									<Badge variant="outline" className="text-xs">
										{tree.nodes.length}
									</Badge>
								</div>
							))}

							{state.currentProject.dialogTrees.length === 0 && (
								<p className="text-sm text-muted-foreground p-2">
									No dialog trees yet. Create one to get started.
								</p>
							)}
						</div>
					</div>

					{/* Characters */}
					<div className="p-4 border-t border-border">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-medium">Characters</h3>
							<Button size="sm" variant="ghost" onClick={addCharacter}>
								<Plus className="w-3 h-3" />
							</Button>
						</div>

						<div className="space-y-1">
							{state.currentProject.characters.map((character) => (
								<div
									key={character.id}
									className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50"
								>
									<div
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: character.color }}
									/>
									<Users className="w-4 h-4 text-muted-foreground" />
									<span className="flex-1 text-sm">{character.name}</span>
								</div>
							))}

							{state.currentProject.characters.length === 0 && (
								<p className="text-sm text-muted-foreground p-2">
									No characters yet. Add some to organize your dialogs.
								</p>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
