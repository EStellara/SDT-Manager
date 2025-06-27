import { ProjectSidebar } from "@/components/ProjectSidebar";
import { DialogTreeEditor } from "@/components/DialogTreeEditor";
import { ThemeToggle } from "@/components/theme-toggle";

export function DialogProjectPage() {
	return (
		<div className="min-h-screen bg-background flex relative">
			<ThemeToggle />

			{/* Sidebar */}
			<ProjectSidebar />

			{/* Main Content */}
			<div className="flex-1 h-screen">
				<DialogTreeEditor />
			</div>
		</div>
	);
}
