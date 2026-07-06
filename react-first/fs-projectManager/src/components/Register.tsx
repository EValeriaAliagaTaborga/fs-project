import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest, translateMessage } from "../api/auth";

// "feedback" es el mensaje que se muestra bajo el formulario: verde si success, rojo si error
type Feedback = {
	type: "success" | "error";
	text: string;
};

function Register() {
	// Estado local del formulario: lo que el usuario va escribiendo en cada campo
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	// Mensaje a mostrar (éxito/error). Empieza en null porque todavía no se intentó registrar
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	// navigate() permite mandar al usuario a /login por código una vez que el registro salió bien
	const navigate = useNavigate();

	const handleSubmit = async (event: FormEvent) => {
		// Evita que el navegador recargue la página al enviar el <form> (comportamiento HTML por defecto)
		event.preventDefault();
		setFeedback(null); // limpia cualquier mensaje de un intento anterior

		try {
			// 1. Le pide al backend que cree el usuario (ver POST /register en backend/src/index.ts).
			// El backend hashea la contraseña con bcrypt antes de guardarla, nunca la guarda en texto plano.
			const result = await registerRequest(name, email, password);

			if (result.ok) {
				// 2a. Registro correcto (201): se avisa al usuario y, tras una breve pausa para que
				// alcance a leer el mensaje, se lo manda a /login a iniciar sesión con la cuenta creada.
				setFeedback({ type: "success", text: "Usuario registrado exitosamente." });
				setTimeout(() => navigate("/login"), 1200);
			} else {
				// 2b. Registro rechazado (400): puede ser porque faltan campos o porque el email ya
				// existe ("User already exists"). translateMessage lo traduce a español.
				setFeedback({ type: "error", text: translateMessage(result.message) || "No se pudo registrar el usuario" });
			}
		} catch (error) {
			// El fetch mismo falló (backend caído, sin red, CORS, etc.), no una respuesta de error del backend
			setFeedback({ type: "error", text: "No se pudo conectar con el servidor" });
		}
	};

	return (
		<div className="auth-container">
			<form className="auth-form" onSubmit={handleSubmit}>
				<h2>Registrar usuario</h2>
				<label>
					Nombre
					<input
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						required
					/>
				</label>
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
					Registrar
				</button>
				{feedback && <p className={`auth-message auth-message--${feedback.type}`}>{feedback.text}</p>}
				<p className="auth-switch">
					¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
				</p>
			</form>
		</div>
	);
}

export default Register;
