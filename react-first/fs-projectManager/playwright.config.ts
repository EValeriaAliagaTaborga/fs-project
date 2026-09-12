import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./e2e",

	/* Genera el reporte HTML navegable en playwright-report/, que es lo que abre
	   `npx playwright show-report`. Sin esta línea Playwright usa el reporter "list",
	   que solo imprime en la terminal y no deja ningún archivo: por eso show-report
	   respondía "No report found". "open: never" evita que el reporte se abra solo
	   al terminar una corrida con fallos. */
	reporter: [["html", { open: "never" }]],

	use: {
		/* Base URL to use in actions like `await page.goto('')`. */
		baseURL: "http://localhost:5173",

		/* Guarda una traza (video paso a paso + DOM de cada acción) cuando una prueba
		   falla y se reintenta. Se ve desde el reporte HTML.
		   Para capturar la traza de TODAS las corridas, incluso las verdes:
		   npx playwright test --trace on */
		trace: "on-first-retry",

		/* Captura de pantalla automática solo cuando una prueba falla */
		screenshot: "only-on-failure",
	},

	/* Navegadores contra los que se corren las pruebas.
	   Solo Chromium, a propósito: el job de CI instala únicamente ese navegador
	   (npx playwright install --with-deps chromium), así que agregar Firefox o WebKit
	   acá haría fallar el pipeline con "Executable doesn't exist". Si en algún momento
	   quieres sumarlos, hay que descomentarlos acá Y agregarlos al workflow. */
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},

		// {
		//   name: 'firefox',
		//   use: { ...devices['Desktop Firefox'] },
		// },

		// {
		//   name: 'webkit',
		//   use: { ...devices['Desktop Safari'] },
		// },

		/* Test against mobile viewports. */
		// {
		//   name: 'Mobile Chrome',
		//   use: { ...devices['Pixel 5'] },
		// },
		// {
		//   name: 'Mobile Safari',
		//   use: { ...devices['iPhone 12'] },
		// },

		/* Test against branded browsers. */
		// {
		//   name: 'Microsoft Edge',
		//   use: { ...devices['Desktop Edge'], channel: 'msedge' },
		// },
		// {
		//   name: 'Google Chrome',
		//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
		// },
	],

	/* Levanta los servidores que las pruebas necesitan antes de correrlas.
	   Son dos porque la app es fullstack: sin el backend, el login falla y no hay tareas.
	   Playwright espera a que cada "url" responda antes de empezar.

	   reuseExistingServer: en tu máquina queda en true, así que si ya tenías los
	   servidores corriendo a mano los reutiliza en vez de levantar otros. En CI
	   (GitHub define la variable CI=true) queda en false: el runner arranca limpio
	   y así nos aseguramos de probar contra servidores recién levantados. */
	webServer: [
		{
			// Backend Express + PostgreSQL. GET / responde "Backend is working".
			command: "npm run dev",
			cwd: "../backend",
			url: "http://localhost:3000",
			reuseExistingServer: !process.env["CI"],
			timeout: 60_000,
		},
		{
			// Frontend Vite. El script se llama "dev" (ver package.json), no "start".
			command: "npm run dev",
			url: "http://localhost:5173",
			reuseExistingServer: !process.env["CI"],
			timeout: 60_000,
		},
	],
});
