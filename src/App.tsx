import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
			<ThemeToggle />
			<div className="w-full max-w-2xl space-y-6">
				{/* Main Card */}
				<Card className="w-full border-border/50 shadow-xl">
					<CardHeader className="text-center pb-4">
						<CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							SDT Manager
						</CardTitle>
						<CardDescription className="text-base text-muted-foreground">
							A modern Vite + React + TypeScript application with shadcn/ui and fuchsia theme
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Counter Section */}
						<div className="text-center space-y-4">
							<div className="p-6 rounded-lg bg-secondary/20 border border-primary/20">
								<p className="text-2xl font-bold text-primary mb-2">Counter</p>
								<p className="text-4xl font-mono font-bold text-foreground">{count}</p>
							</div>
							
							{/* Button Grid */}
							<div className="grid grid-cols-3 gap-3">
								<Button 
									onClick={() => setCount((count) => count + 1)} 
									className="h-12 text-base font-semibold"
									size="lg"
								>
									+1
								</Button>
								<Button 
									variant="outline" 
									onClick={() => setCount((count) => count - 1)} 
									className="h-12 text-base font-semibold"
									size="lg"
								>
									-1
								</Button>
								<Button 
									variant="secondary" 
									onClick={() => setCount(0)} 
									className="h-12 text-base font-semibold"
									size="lg"
								>
									Reset
								</Button>
							</div>

							{/* Quick Actions */}
							<div className="flex gap-2 justify-center">
								<Button 
									variant="ghost" 
									size="sm"
									onClick={() => setCount(count + 10)}
									className="text-accent hover:text-accent-foreground"
								>
									+10
								</Button>
								<Button 
									variant="ghost" 
									size="sm"
									onClick={() => setCount(count * 2)}
									className="text-accent hover:text-accent-foreground"
								>
									×2
								</Button>
								<Button 
									variant="ghost" 
									size="sm"
									onClick={() => setCount(Math.max(0, count - 10))}
									className="text-accent hover:text-accent-foreground"
								>
									-10
								</Button>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex-col gap-2 pt-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
							Built with Vite + React + TypeScript + shadcn/ui
						</div>
						<div className="text-xs text-muted-foreground/70">
							Featuring a custom dark fuchsia theme
						</div>
					</CardFooter>
				</Card>

				{/* Theme Showcase */}
				<div className="grid grid-cols-2 gap-4">
					<Card className="border-primary/30">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg text-primary">Primary Theme</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex gap-2">
								<div className="w-6 h-6 rounded bg-primary"></div>
								<div className="w-6 h-6 rounded bg-primary/80"></div>
								<div className="w-6 h-6 rounded bg-primary/60"></div>
							</div>
						</CardContent>
					</Card>
					
					<Card className="border-accent/30">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg text-accent">Accent Colors</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex gap-2">
								<div className="w-6 h-6 rounded bg-accent"></div>
								<div className="w-6 h-6 rounded bg-accent/80"></div>
								<div className="w-6 h-6 rounded bg-accent/60"></div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default App;
