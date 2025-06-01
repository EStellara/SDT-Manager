import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage, DialogProjectPage, NotFoundPage } from "@/pages";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/project" element={<DialogProjectPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</Router>
	);
}

export default App;
