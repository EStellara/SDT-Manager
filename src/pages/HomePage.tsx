import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Folder, Clock, Upload, AlertCircle } from "lucide-react";
import { useDialogProject } from "@/contexts/DialogProjectContext";
import { openFilePicker, importProject } from "@/lib/fileImport";
import { useDragAndDrop } from "@/lib/useDragAndDrop";

export function HomePage() {
	const navigate = useNavigate();
	const { dispatch } = useDialogProject();
	const [projectName, setProjectName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCreateProject = () => {
		if (projectName.trim()) {
			// Create a new project and navigate to the dialog project page
			dispatch({
				type: "CREATE_PROJECT",
				payload: {
					name: projectName.trim(),
					description: `New project created on ${new Date().toLocaleDateString()}`,
				},
			});
			navigate("/project");
		}
	};
	const handleOpenProject = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Open file picker for project files
			const file = await openFilePicker(".json,.zip");

			if (!file) {
				setIsLoading(false);
				return; // User cancelled
			}

			await importProjectFile(file);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to load project";
			setError(errorMessage);
			console.error("Failed to import project:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const importProjectFile = async (file: File) => {
		// Import the project
		const project = await importProject(file);

		// Load the project into the context
		dispatch({ type: "LOAD_PROJECT", payload: project });

		// Navigate to the project page
		navigate("/project");
	};

	const handleFileDrop = async (files: FileList) => {
		if (files.length > 0) {
			const file = files[0]; // Take the first file
			try {
				setIsLoading(true);
				setError(null);
				await importProjectFile(file);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to load project";
				setError(errorMessage);
				console.error("Failed to import dropped file:", err);
			} finally {
				setIsLoading(false);
			}
		}
	};
	const { dragProps, isDragOver } = useDragAndDrop({
		onFileDrop: handleFileDrop,
		accept: [".json", ".zip"],
	});

	// TODO: Replace with actual recent projects from local storage or a data store
	const recentProjects = [
		{ name: "Adventure Game Dialog", lastModified: "2 days ago" },
		{ name: "NPC Conversation System", lastModified: "1 week ago" },
		{ name: "Quest Dialog Tree", lastModified: "2 weeks ago" },
	];

	return (
		<div className="min-h-screen bg-background">
			<ThemeToggle />

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* Header */}
					<div className="text-center space-y-4">
						<h1 className="text-4xl font-bold tracking-tight">SDT Manager</h1>
						<p className="text-lg text-muted-foreground">
							Create and manage your dialog trees for interactive storytelling
						</p>
					</div>
					{/* Action Cards */}
					<div className="grid md:grid-cols-2 gap-6">
						{/* Create New Project */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Plus className="h-5 w-5" />
									Create New Project
								</CardTitle>
								<CardDescription>Start building a new dialog tree from scratch</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="project-name">Project Name</Label>
									<Input
										id="project-name"
										placeholder="Enter project name..."
										value={projectName}
										onChange={(e) => setProjectName(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
									/>
								</div>
								<Button onClick={handleCreateProject} className="w-full" disabled={!projectName.trim()}>
									Create Project
								</Button>
							</CardContent>
						</Card>{" "}
						{/* Open Existing Project */}
						<Card className="drag-zone" {...dragProps}>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Folder className="h-5 w-5" />
									Open Existing Project
								</CardTitle>
								<CardDescription>
									Load a dialog tree project from your computer (JSON or ZIP)
									<br />
									<span className="text-xs flex items-center gap-1 mt-1 text-muted-foreground">
										<Upload className="h-3 w-3" />
										Click to browse or drag & drop files here
									</span>
								</CardDescription>
							</CardHeader>{" "}
							<CardContent>
								{error && (
									<div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center justify-between">
										<div className="flex items-center gap-2">
											<AlertCircle className="h-4 w-4" />
											<span className="text-sm">{error}</span>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setError(null)}
											className="h-6 w-6 p-0 text-red-700 hover:text-red-800"
										>
											×
										</Button>
									</div>
								)}

								{isDragOver && (
									<div className="mb-4 p-3 bg-primary/10 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
										<div className="flex items-center gap-2 text-primary">
											<Upload className="h-5 w-5" />
											<span className="font-medium">Drop your project file here</span>
										</div>
									</div>
								)}

								<Button
									onClick={handleOpenProject}
									className="w-full"
									variant="outline"
									disabled={isLoading}
								>
									{isLoading ? (
										<>
											<Upload className="mr-2 h-4 w-4 animate-spin" />
											Loading Project...
										</>
									) : (
										<>
											<Folder className="mr-2 h-4 w-4" />
											Browse Files
										</>
									)}
								</Button>
							</CardContent>
						</Card>
					</div>{" "}
					{/* Recent Projects */}
					{recentProjects.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="h-5 w-5" />
									Recent Projects
								</CardTitle>
								<CardDescription>Continue working on your recent dialog trees</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{recentProjects.map((project, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
											onClick={() => navigate("/project")}
										>
											<div className="flex items-center gap-3">
												<Folder className="h-4 w-4 text-muted-foreground" />
												<div>
													<div className="font-medium">{project.name}</div>
													<div className="text-sm text-muted-foreground">
														Last modified {project.lastModified}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
					{/* Help Section */}
					<Card className="bg-muted/30">
						<CardHeader>
							<CardTitle className="text-lg">Supported File Formats</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3 text-sm text-muted-foreground">
								<div className="flex items-start gap-3">
									<div className="font-medium text-foreground min-w-[80px]">JSON Files:</div>
									<div>
										Single project files exported from SDT Manager or individual dialog tree files
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="font-medium text-foreground min-w-[80px]">ZIP Files:</div>
									<div>
										Structured project exports containing multiple dialog trees, characters, and
										project metadata
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="font-medium text-foreground min-w-[80px]">Features:</div>
									<div>
										Automatic character merging, conflict resolution, and preservation of all dialog
										tree connections
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
