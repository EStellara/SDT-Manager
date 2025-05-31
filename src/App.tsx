import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-3xl font-bold">SDT Manager</CardTitle>
					<CardDescription>A modern Vite + React + TypeScript application with shadcn/ui</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center">
						<p className="text-lg font-medium mb-4">Counter: {count}</p>
						<div className="space-x-2">
							<Button onClick={() => setCount((count) => count + 1)} className="w-20">
								+1
							</Button>
							<Button variant="outline" onClick={() => setCount((count) => count - 1)} className="w-20">
								-1
							</Button>
							<Button variant="secondary" onClick={() => setCount(0)} className="w-20">
								Reset
							</Button>
						</div>
					</div>
				</CardContent>
				<CardFooter className="justify-center">
					<p className="text-sm text-muted-foreground">Built with Vite + React + TypeScript + shadcn/ui</p>
				</CardFooter>
			</Card>
		</div>
	);
}

export default App;
