import { describe, it, expect } from "vitest";
import { contarTareasPendientes, contarTareasCompletadas, calcularEstadisticas } from "./tareas";

describe("contarTareasPendientes", () => {
	it("cuenta solo las tareas no completadas", () => {
		// Arrange
		const tareas = [{ completed: true }, { completed: false }, { completed: false }];
		// Act
		const resultado = contarTareasPendientes(tareas);
		// Assert
		expect(resultado).toBe(2);
	});

	it("devuelve 0 cuando la lista está vacía", () => {
		expect(contarTareasPendientes([])).toBe(0);
	});

	it("devuelve 0 cuando todas las tareas están completadas", () => {
		const tareas = [{ completed: true }, { completed: true }];
		expect(contarTareasPendientes(tareas)).toBe(0);
	});

	it("no modifica el array que recibe", () => {
		// Arrange: una función pura no debe tocar sus argumentos
		const tareas = [{ completed: true }, { completed: false }];
		// Act
		contarTareasPendientes(tareas);
		// Assert
		expect(tareas).toEqual([{ completed: true }, { completed: false }]);
	});
});

describe("contarTareasCompletadas", () => {
	it("cuenta solo las tareas completadas", () => {
		const tareas = [{ completed: true }, { completed: false }, { completed: true }];
		expect(contarTareasCompletadas(tareas)).toBe(2);
	});

	it("devuelve 0 cuando la lista está vacía", () => {
		expect(contarTareasCompletadas([])).toBe(0);
	});
});

describe("calcularEstadisticas", () => {
	it("devuelve total, completadas y pendientes de una lista mixta", () => {
		// Arrange
		const tareas = [{ completed: true }, { completed: false }, { completed: false }];
		// Act
		const resultado = calcularEstadisticas(tareas);
		// Assert
		expect(resultado).toEqual({ total: 3, completadas: 1, pendientes: 2 });
	});

	it("devuelve todo en 0 cuando la lista está vacía", () => {
		expect(calcularEstadisticas([])).toEqual({ total: 0, completadas: 0, pendientes: 0 });
	});

	it("mantiene la coherencia: completadas + pendientes es igual al total", () => {
		const tareas = [{ completed: true }, { completed: false }, { completed: true }, { completed: false }];
		const resultado = calcularEstadisticas(tareas);
		expect(resultado.completadas + resultado.pendientes).toBe(resultado.total);
	});
});
