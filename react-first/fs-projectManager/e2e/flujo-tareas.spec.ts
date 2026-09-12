// e2e/flujo-tareas.spec.ts
//
// Prueba end-to-end del flujo completo "crear una tarea": a diferencia de las pruebas
// unitarias con Vitest (que montan un componente aislado), acá Playwright abre un navegador
// real contra la app corriendo de verdad, con el backend Express y PostgreSQL detrás.
//
// Para que corra necesitas los dos servidores levantados (playwright.config.ts los arranca solo):
//   - backend en http://localhost:3000  (npm run dev dentro de react-first/backend)
//   - frontend en http://localhost:5173 (npm run dev dentro de react-first/fs-projectManager)
import { test, expect } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

// Misma URL que usa el frontend (ver src/api/auth.ts). La prueba la necesita para hablarle
// directo al backend en los pasos que NO son parte del flujo que queremos probar.
const API_URL = process.env["VITE_API_URL"] ?? "http://localhost:3000";

const PASSWORD_DE_PRUEBA = "e2e12345";

// Crea un usuario nuevo llamando directo a POST /register, sin pasar por la UI.
//
// ¿Por qué por API y no llenando el formulario de registro? Porque el registro no es lo que
// esta prueba quiere verificar: es solo una precondición. Hacerlo por API es más rápido y,
// sobre todo, evita que un bug en la pantalla de registro haga fallar una prueba de tareas.
// Regla general: el flujo bajo prueba se hace por la UI, las precondiciones por API.
async function crearUsuarioDePrueba(request: APIRequestContext) {
	// Email único por corrida: si usáramos uno fijo, la segunda ejecución fallaría con
	// "User already exists" (el campo email es @unique en schema.prisma).
	const email = `e2e-${Date.now()}@fsprojectmanager.local`;

	const respuesta = await request.post(`${API_URL}/register`, {
		data: { name: "Usuario E2E", email, password: PASSWORD_DE_PRUEBA },
	});
	// Si el backend o la base no están arriba, esto falla acá con un mensaje claro
	// en vez de fallar más adelante de forma confusa (ej. "credenciales inválidas").
	expect(respuesta.ok(), "No se pudo registrar el usuario de prueba: ¿está corriendo el backend?").toBeTruthy();

	return { email, password: PASSWORD_DE_PRUEBA };
}

test.describe("Flujo de tareas", () => {
	test("un usuario con sesión iniciada puede crear una tarea y verla en la lista", async ({ page, request }) => {
		const usuario = await crearUsuarioDePrueba(request);

		// 1. Entrar a la aplicación.
		// "/" se resuelve contra el baseURL de playwright.config.ts. App.tsx redirige
		// cualquier ruta desconocida (y la raíz) a /login, así que caemos en el formulario.
		await page.goto("/");
		await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();

		// 2. Iniciar sesión.
		// getByLabel busca el campo por su <label> asociado, igual que lo haría un lector de
		// pantalla. Es más estable que un selector CSS: si cambia la clase o el orden del DOM
		// la prueba sigue funcionando, pero si se rompe la accesibilidad, falla (y está bien).
		await page.getByLabel("Email").fill(usuario.email);
		await page.getByLabel("Contraseña").fill(usuario.password);
		await page.getByRole("button", { name: "Iniciar sesión" }).click();

		// Login.tsx guarda el token y recién después de 800ms navega a /profile, donde
		// ProtectedRoute vuelve a validar el token contra el backend. No hace falta ningún
		// sleep: los expect de Playwright reintentan solos hasta que la condición se cumple
		// o se agota el timeout (auto-waiting).
		await expect(page).toHaveURL(/\/profile$/);
		await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();

		// 3. Crear la tarea (este es el flujo que realmente estamos probando, y va por la UI).
		// El texto lleva un sufijo único porque la tabla Task es compartida: sin él, una tarea
		// vieja de otra corrida podría hacer pasar la prueba sin que se haya creado nada.
		const textoTarea = `Preparar demo de Playwright ${Date.now()}`;
		await page.getByLabel("New task").fill(textoTarea);
		await page.getByRole("button", { name: "Add Task" }).click();

		// 4. Verificar que aparece en la lista de tareas en progreso.
		// Buscamos el <li> que contiene el texto en vez de solo el texto suelto: así afirmamos
		// que la tarea se renderizó como un ítem real de la lista, no en cualquier otro lado.
		const tareaEnLista = page.getByRole("listitem").filter({ hasText: textoTarea });
		await expect(tareaEnLista).toBeVisible();

		// Y que quedó sin completar, que es como TaskManager crea toda tarea nueva.
		await expect(tareaEnLista.getByRole("checkbox")).not.toBeChecked();

		// 5. El input queda vacío después de agregar, listo para la siguiente tarea.
		await expect(page.getByLabel("New task")).toHaveValue("");
	});

	test("no se crean tareas vacías", async ({ page, request }) => {
		const usuario = await crearUsuarioDePrueba(request);

		await page.goto("/");
		await page.getByLabel("Email").fill(usuario.email);
		await page.getByLabel("Contraseña").fill(usuario.password);
		await page.getByRole("button", { name: "Iniciar sesión" }).click();
		await expect(page).toHaveURL(/\/profile$/);

		// Cuántas tareas hay antes de intentar agregar una vacía
		const tareasAntes = await page.getByRole("listitem").count();

		// Solo espacios: TaskInput hace trim() y corta antes de avisarle al padre
		await page.getByLabel("New task").fill("   ");
		await page.getByRole("button", { name: "Add Task" }).click();

		// La cantidad no cambió. Usamos expect.poll (y no un count() directo) para darle a la
		// app la oportunidad de renderizar algo: si igual no aparece nada, la prueba pasa.
		await expect.poll(() => page.getByRole("listitem").count()).toBe(tareasAntes);
	});
});
