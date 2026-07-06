import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isTokenValid, TOKEN_KEY } from "../api/auth";

// Este componente envuelve a las rutas que requieren sesión iniciada (acá, /profile).
// "children" es lo que se quiere proteger (en App.tsx, <TaskManager />).
//
// Tiene 3 estados posibles mientras decide si dejar pasar al usuario o no:
// - "checking": todavía no se sabe si el token guardado es válido (se está consultando al backend)
// - "authorized": el token es válido, se puede mostrar "children"
// - "unauthorized": no hay token o el token no es válido, hay que mandar a /login
type Status = "checking" | "authorized" | "unauthorized";

function ProtectedRoute({ children }: { children: ReactNode }) {
	// Arranca en "checking": no se asume nada hasta confirmar con el backend
	const [status, setStatus] = useState<Status>("checking");

	// Este efecto corre una sola vez, cada vez que se monta ProtectedRoute (por ejemplo,
	// cada vez que se navega a /profile).
	useEffect(() => {
		// 1. Busca el token guardado por Login.tsx en localStorage
		const token = localStorage.getItem(TOKEN_KEY);
		if (!token) {
			// No hay sesión guardada: directo a "unauthorized", ni siquiera hace falta preguntarle al backend
			setStatus("unauthorized");
			return;
		}
		// 2. Si hay un token, lo valida contra el backend llamando a GET /profile con
		// Authorization: Bearer <token>. Esto cubre el caso de un token vencido (expiresIn: "1h")
		// o de una sesión vieja guardada de una ejecución anterior del backend.
		isTokenValid(token).then((valid) => {
			if (!valid) {
				// 3a. Token inválido o vencido: se limpia de localStorage para no seguir intentando con él
				localStorage.removeItem(TOKEN_KEY);
			}
			// 3b. Token válido: queda autorizado y TaskManager se renderiza normalmente
			setStatus(valid ? "authorized" : "unauthorized");
		});
	}, []);

	// Mientras se espera la respuesta del backend, se muestra un mensaje en vez del contenido protegido
	// (evita mostrar el Task Manager "parpadeando" antes de confirmar la sesión)
	if (status === "checking") {
		return <p className="auth-loading">Verificando sesión...</p>;
	}

	// Sin sesión válida: <Navigate> redirige a /login. "replace" evita que el usuario pueda volver
	// a /profile con el botón "atrás" del navegador una vez deslogueado.
	if (status === "unauthorized") {
		return <Navigate to="/login" replace />;
	}

	// Sesión válida: se renderiza el contenido protegido (TaskManager)
	return <>{children}</>;
}

export default ProtectedRoute;
