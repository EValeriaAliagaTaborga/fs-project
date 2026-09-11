// Funciones puras sobre la lista de tareas.
// "Puras" quiere decir que el resultado depende únicamente de los parámetros recibidos:
// no leen estado de React, no llaman al backend y no modifican el array que reciben.
// Por eso se pueden probar directamente (ver tareas.test.ts) sin montar componentes
// ni levantar el servidor Express.

// Solo se declara el campo que estas funciones realmente usan. Cualquier objeto que
// tenga "completed" sirve como argumento (incluido el type Task de TaskManager),
// lo que permite armar tareas mínimas en las pruebas.
type TareaContable = {
	completed: boolean;
};

// Cuenta las tareas que todavía NO están marcadas como completadas.
export function contarTareasPendientes(tareas: TareaContable[]): number {
	return tareas.filter((tarea) => !tarea.completed).length;
}

// Cuenta las tareas ya marcadas como completadas.
export function contarTareasCompletadas(tareas: TareaContable[]): number {
	return tareas.filter((tarea) => tarea.completed).length;
}

// Las tres cifras que muestra el Footer, agrupadas en un solo objeto.
export type EstadisticasTareas = {
	total: number;
	completadas: number;
	pendientes: number;
};

// Calcula de una sola pasada lo que antes TaskManager resolvía con .filter en el JSX.
export function calcularEstadisticas(tareas: TareaContable[]): EstadisticasTareas {
	return {
		total: tareas.length,
		completadas: contarTareasCompletadas(tareas),
		pendientes: contarTareasPendientes(tareas),
	};
}
