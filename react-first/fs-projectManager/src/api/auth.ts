// URL base del backend Express (ver backend/src/index.ts)
const API_URL = "http://localhost:3000";

// Clave usada para guardar el token JWT en localStorage.
// Se centraliza acá para que Login, ProtectedRoute y TaskManager usen siempre la misma clave.
export const TOKEN_KEY = "session_token";

// Forma común de respuesta para register/login: si salió bien (ok) y el mensaje del backend
type ApiResult = {
	ok: boolean;
	message: string;
};

// El login además devuelve el token JWT cuando las credenciales son válidas
type LoginResult = ApiResult & {
	token?: string;
};

// Llama a POST /register del backend. El backend hashea la password y crea el usuario en PostgreSQL;
// si el email ya existe, responde 400 con message: "User already exists".
export async function registerRequest(name: string, email: string, password: string): Promise<ApiResult> {
	const response = await fetch(`${API_URL}/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	});
	const data = await response.json();
	// response.ok es true solo para status 2xx (201 = creado). Si fue 400, ok queda en false
	// y el componente que llama a esta función usa "message" para mostrar el error.
	return { ok: response.ok, message: data.message };
}

// Llama a POST /login del backend. Si el email/password son correctos, el backend firma
// un JWT (jwt.sign) y lo devuelve en "token"; ese token es lo que después se manda como
// Authorization: Bearer <token> para acceder a la ruta protegida /profile.
export async function loginRequest(email: string, password: string): Promise<LoginResult> {
	const response = await fetch(`${API_URL}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	const data = await response.json();
	// Si la respuesta fue 401 (credenciales inválidas), data.token viene undefined.
	return { ok: response.ok, message: data.message, token: data.token };
}

// El backend responde sus mensajes en inglés (ver backend/src/index.ts). Como el resto de la
// UI está en español, acá se traducen los mensajes conocidos para que se vean consistentes.
// Si llega un mensaje que no está en el mapa, se muestra tal cual vino del backend.
const MESSAGE_TRANSLATIONS: Record<string, string> = {
	"User already exists": "Ya existe un usuario registrado con ese email",
	"Invalid credentials": "Credenciales inválidas",
	"Name, email and password are required": "Nombre, email y contraseña son obligatorios",
	"Email and password are required": "Email y contraseña son obligatorios",
};

export function translateMessage(message: string): string {
	return MESSAGE_TRANSLATIONS[message] ?? message;
}

// Verifica si un token sigue siendo válido llamando a la ruta protegida GET /profile.
// El backend hace jwt.verify(token, "secret_key"): si el token es válido y no expiró,
// responde 200; si no, responde 401. ProtectedRoute usa esto para decidir si deja pasar
// al Task Manager o redirige a /login.
export async function isTokenValid(token: string): Promise<boolean> {
	const response = await fetch(`${API_URL}/profile`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.ok;
}

// Arma el header Authorization a partir del token guardado por Login.tsx.
// Todas las rutas de /tasks ahora pasan por el middleware verifyToken del backend,
// así que cualquier fetch a esas rutas necesita este header para no recibir 401.
export function authHeader(): Record<string, string> {
	const token = localStorage.getItem(TOKEN_KEY);
	return token ? { Authorization: `Bearer ${token}` } : {};
}
