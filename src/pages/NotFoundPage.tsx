import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-background">
			<ThemeToggle />

			<div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<CardTitle className="text-6xl font-bold text-muted-foreground mb-4">404</CardTitle>
						<CardTitle>Page Not Found</CardTitle>
						<CardDescription>
							The page you're looking for doesn't exist or may have been moved.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button onClick={() => navigate("/")} className="w-full">
							<Home className="h-4 w-4 mr-2" />
							Go to Home
						</Button>
						<Button onClick={() => navigate(-1)} variant="outline" className="w-full">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Go Back
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
