import { useState } from "react";
import type { FormEvent } from "react";

// Contrato de props: este componente no guarda las tasks, solo necesita una función
// para "avisarle" al padre (TaskManager) cuándo se escribió una tarea nueva
type TaskInputProps = {
	onAddTask: (taskText: string) => void;
};

function TaskInput(props: TaskInputProps) {
	// Estado local: solo lo que se está escribiendo en este momento.
	// No vive en TaskManager porque a nadie más le importa el texto a medio escribir
	const [inputValue, setInputValue] = useState("");

	// Ahora es el onSubmit del <form>, no el onClick del botón: así se dispara tanto
	// al hacer click en "Add Task" como al presionar Enter dentro del input, que es
	// el comportamiento nativo de un formulario y lo que un usuario espera.
	function handleSubmit(event: FormEvent) {
		event.preventDefault(); // evita que el navegador recargue la página al enviar el <form>

		const textoLimpio = inputValue.trim();

		if (textoLimpio === "") {
			return; // evita crear tareas vacías o solo con espacios
		}

		props.onAddTask(textoLimpio); // delega la creación real de la tarea al padre (TaskManager)
		setInputValue(""); // limpia el campo de texto después de agregar
	}

	return (
		<form className="task-input-container" onSubmit={handleSubmit}>
			{/* El <label> asociado al input por htmlFor/id es lo que permite que un lector de
			    pantalla (y también las pruebas, con getByLabelText) identifiquen el campo.
			    El placeholder no cumple ese rol: desaparece apenas se escribe algo.
			    Se oculta visualmente con .sr-only para no alterar el diseño existente,
			    pero sigue estando disponible para tecnologías de asistencia. */}
			<label className="sr-only" htmlFor="new-task-input">
				New task
			</label>
			{/* input controlado: su valor en pantalla siempre refleja el estado "inputValue" */}
			<input
				id="new-task-input"
				type="text"
				placeholder="Enter a new task"
				className="task-input"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)} // actualiza el estado en cada tecla
			/>
			<button type="submit" className="add-task-btn">
				Add Task
			</button>
		</form>
	);
}
export default TaskInput;
