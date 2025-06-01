import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Folder, Clock } from "lucide-react";

export function HomePage() {
	const navigate = useNavigate();
	const [projectName, setProjectName] = useState("");

	const handleCreateProject = () => {
		if (projectName.trim()) {
			// Navigate to the dialog project page
			navigate("/project");
		}
	};

	const handleOpenProject = () => {
		// TODO: Implement file picker for opening existing projects
		navigate("/project");
	};

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
						</Card>

						{/* Open Existing Project */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Folder className="h-5 w-5" />
									Open Existing Project
								</CardTitle>
								<CardDescription>Load a dialog tree project from your computer</CardDescription>
							</CardHeader>
							<CardContent>
								<Button onClick={handleOpenProject} className="w-full" variant="outline">
									Browse Files
								</Button>
							</CardContent>
						</Card>
					</div>

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
				</div>
			</div>
		</div>
	);
}
