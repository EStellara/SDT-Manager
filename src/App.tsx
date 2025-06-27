import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DialogProjectProvider } from "@/contexts/DialogProjectContext";
import { HomePage, DialogProjectPage, NotFoundPage } from "@/pages";

function App() {
	return (
		<DialogProjectProvider>
			<Router>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/project" element={<DialogProjectPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</Router>
		</DialogProjectProvider>
	);
}

export default App;
