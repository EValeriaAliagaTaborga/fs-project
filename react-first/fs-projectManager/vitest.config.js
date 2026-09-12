// vitest.config.js
//
// La configuración de pruebas ya vivía dentro del bloque "test" de vite.config.js.
// Este archivo NO la reemplaza: la extiende.
//
// Es una diferencia importante respecto del ejemplo de la guía. Cuando existen los dos
// archivos, Vitest usa vitest.config.js e ignora vite.config.js por completo; si acá
// pusiéramos solo el bloque de cobertura, se perdería el plugin de React y las pruebas
// de componente (TaskInput.test.tsx, que usa JSX) dejarían de compilar. mergeConfig
// combina ambas configuraciones y evita ese problema.
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			// Vitest solo corre las pruebas que están dentro de src/.
			// Sin esta línea toma su patrón por defecto (**/*.test.* y **/*.spec.*) y
			// también levanta e2e/flujo-tareas.spec.ts, que es de Playwright: falla con
			// "Playwright Test did not expect test.describe() to be called here".
			// Cada herramienta corre lo suyo: Vitest src/, Playwright e2e/.
			include: ["src/**/*.{test,spec}.{ts,tsx}"],

			coverage: {
				// v8 usa el medidor de cobertura que ya trae Node por dentro,
				// en vez de instrumentar el código fuente como hacía Istanbul
				provider: "v8",

				// "text" imprime la tabla resumen en la terminal;
				// "html" genera coverage/index.html, el reporte navegable del paso 2.4.
				//
				// skipFull: false es importante. Por defecto la tabla de la terminal OCULTA
				// los archivos que están al 100%, así que los archivos bien probados
				// simplemente no aparecen y parece que no se estuvieran midiendo (el total
				// de la carpeta sí los cuenta, pero la fila del archivo no se muestra).
				// Con esto la tabla lista todos los archivos, cubiertos y sin cubrir.
				reporter: [["text", { skipFull: false }], ["html", {}]],

				// Sin thresholds, `vitest run --coverage` informa el porcentaje pero
				// siempre termina en verde. Con ellos, devuelve error si la cobertura
				// baja del mínimo: esto es lo que convierte la cobertura en parte real
				// del quality gate del Laboratorio 3.
				//
				// Los valores del ejemplo de la guía (60/60/50/60) no aplican a este
				// proyecto. La Sesión 3 pedía un mínimo de pruebas —dos unitarias sobre
				// una función pura y una de componente— y eso es lo que hay: tareas.ts,
				// validaciones.ts y TaskInput.tsx están al 100%, pero la autenticación,
				// el ruteo y la capa que habla con la API nunca entraron en ese alcance.
				//
				// Así que el umbral se fija en la cobertura real de hoy, redondeada hacia
				// abajo. No es una meta de calidad: es un piso que impide retroceder. Si
				// alguien borra una de las pruebas existentes, el pipeline se cae. La forma
				// de subir estos números es escribir pruebas para los archivos que hoy
				// están en 0%, no editar esta línea.
				thresholds: {
					lines: 12, // real: 12.59%
					functions: 20, // real: 20%
					branches: 4, // real: 4.76%
					statements: 13, // real: 13.33%
				},

				// Qué archivos entran en la medición. Sin esto, el porcentaje se calcula
				// solo sobre los archivos que alguna prueba llegó a importar, y los que
				// nadie prueba (que son justamente los que interesan) no aparecerían.
				include: ["src/**/*.{ts,tsx}"],

				// Y qué se deja afuera: archivos que no son lógica de la aplicación y
				// solo ensuciarían el porcentaje hacia abajo sin ningún riesgo real.
				exclude: [
					"src/**/*.test.{ts,tsx}", // las pruebas mismas
					"src/test/**", // setup de las pruebas
					"src/main.tsx", // punto de entrada: solo monta React en el DOM
					"src/**/*.d.ts", // declaraciones de tipos, no generan código
					"src/generated/**", // código generado automáticamente
				],
			},
		},
	}),
);
