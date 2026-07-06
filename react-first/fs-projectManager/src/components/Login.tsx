import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest, TOKEN_KEY, translateMessage } from "../api/auth";

// "feedback" es el mensaje que se muestra bajo el formulario: verde si success, rojo si error
type Feedback = {
	type: "success" | "error";
	text: string;
};

function Login() {
	// Estado local del formulario: lo que el usuario va escribiendo en cada campo
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	// Mensaje a mostrar (éxito/error). Empieza en null porque todavía no se intentó loguear
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	// navigate() permite cambiar de ruta por código (ej. mandar a /profile tras loguear)
	const navigate = useNavigate();

	const handleSubmit = async (event: FormEvent) => {
		// Evita que el navegador recargue la página al enviar el <form> (comportamiento HTML por defecto)
		event.preventDefault();
		setFeedback(null); // limpia cualquier mensaje de un intento anterior

		try {
			// 1. Le pide al backend que valide email+password (ver POST /login en backend/src/index.ts)
			const result = await loginRequest(email, password);

			if (result.ok && result.token) {
				// 2a. Login correcto: el backend devolvió un JWT. Se guarda en localStorage para que
				// ProtectedRoute y TaskManager puedan reutilizarlo (por ejemplo al recargar la página).
				localStorage.setItem(TOKEN_KEY, result.token);
				setFeedback({ type: "success", text: "Inicio de sesión exitoso. Token de sesión guardado." });
				// 3. Espera un momento para que el usuario alcance a leer el mensaje y recién ahí
				// redirige a /profile, donde ProtectedRoute vuelve a validar el token contra el backend.
				setTimeout(() => navigate("/profile"), 800);
			} else {
				// 2b. Login rechazado (401): el backend manda "Invalid credentials" si el email no existe
				// o si la contraseña no coincide. translateMessage lo traduce a español.
				setFeedback({ type: "error", text: translateMessage(result.message) || "Credenciales inválidas" });
			}
		} catch (error) {
			// El fetch mismo falló (backend caído, sin red, CORS, etc.), no una respuesta de error del backend
			setFeedback({ type: "error", text: "No se pudo conectar con el servidor" });
		}
	};

	return (
		<div className="auth-container">
			<form className="auth-form" onSubmit={handleSubmit}>
				<h2>Iniciar sesión</h2>
				<label>
					Email
					<input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>
				</label>
				<label>
					Contraseña
					<input
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>
				</label>
				<button type="submit" className="auth-btn">
					Iniciar sesión
				</button>
				{feedback && <p className={`auth-message auth-message--${feedback.type}`}>{feedback.text}</p>}
				<p className="auth-switch">
					¿No tienes cuenta? <Link to="/register">Registrar usuario</Link>
				</p>
			</form>
		</div>
	);
}

export default Login;
