import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import TaskManager from "./components/TaskManager";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// App ya no arma la pantalla directamente: ahora solo define qué componente se muestra
// según la URL. BrowserRouter habilita el ruteo, Routes/Route mapean cada path a un componente.
function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* "/" no tiene pantalla propia: siempre redirige a /login, que es lo primero
				    que debe ver cualquier usuario (con o sin sesión) */}
				<Route path="/" element={<Navigate to="/login" replace />} />

				{/* Pantallas públicas: no requieren sesión iniciada */}
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				{/* /profile es la ruta protegida: ProtectedRoute decide si el usuario tiene una sesión
				    válida (consultando al backend) antes de mostrar el Task Manager. Si no la tiene,
				    ProtectedRoute redirige a /login por su cuenta. */}
				<Route
					path="/profile"
					element={
						<ProtectedRoute>
							<TaskManager />
						</ProtectedRoute>
					}
				/>

				{/* Cualquier otra URL que no exista también manda a /login */}
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
