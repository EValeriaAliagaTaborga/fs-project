import { useState } from "react";

// Contrato de props: este componente no guarda las tasks, solo necesita una función
// para "avisarle" al padre (App) cuándo se escribió una tarea nueva
type TaskInputProps = {
	onAddTask: (taskText: string) => void;
};

function TaskInput(props: TaskInputProps) {
	// Estado local: solo lo que se está escribiendo en este momento.
	// No vive en App porque a nadie más le importa el texto a medio escribir
	const [inputValue, setInputValue] = useState("");

	// Se ejecuta al hacer click en "Add Task"
	function handleSubmit() {
		if (inputValue.trim() === "") {
			return; // evita crear tareas vacías o solo con espacios
		}

		props.onAddTask(inputValue); // delega la creación real de la tarea al padre (App)
		setInputValue(""); // limpia el campo de texto después de agregar
	}

	return (
		<div className="task-input-container">
			{/* input controlado: su valor en pantalla siempre refleja el estado "inputValue" */}
			<input
				type="text"
				placeholder="Enter a new task"
				className="task-input"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)} // actualiza el estado en cada tecla
			/>
			<button className="add-task-btn" onClick={handleSubmit}>
				Add Task
			</button>
		</div>
	);
}
export default TaskInput;
