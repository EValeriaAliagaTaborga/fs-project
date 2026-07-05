import Header from "./components/Header";
import TaskList from "./components/TaskList";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import "./App.css";
import TaskInput from "./components/TaskInput";

// Forma de cada tarea en la lista: el "contrato" de datos que comparten todos los componentes
type Task = {
	id: number; // identificador único, se usa como key en las listas
	text: string; // el texto visible de la tarea
	completed: boolean; // si la tarea ya fue marcada como hecha
};

function App() {
	// Estado central: la lista de tareas. App es la "fuente de verdad", los demás componentes
	// solo reciben esta lista por props, nunca la modifican directamente
	const [tasks, setTasks] = useState<Task[]>([]);

	// NEW CHANGE: This loads tasks from the backend when React starts.
	useEffect(() => {
		const fetchTasks = async () => {
			const response = await fetch("http://localhost:3000/tasks");
			const data = await response.json();
			setTasks(data);
		};
		fetchTasks();
	}, []);

	/*
	// Crea una tarea nueva a partir del texto que llega desde TaskInput (vía el prop onAddTask)
	// y la agrega de forma inmutable (array nuevo) para que React detecte el cambio
	const addTask = (text: string) => {
		const newTask: Task = {
			id: Date.now(), // usa la marca de tiempo actual como id, garantiza que no se repita
			text: text,
			completed: false, // toda tarea nueva empieza como no completada
		};

		setTasks([...tasks, newTask]);
	};
	*/

	// NEW CHANGE: addTask now sends the new task to the backend using POST.
	const addTask = async (text: string) => {
		const response = await fetch("http://localhost:3000/tasks", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				text: text,
			}),
		});
		const newTask = await response.json();
		setTasks([...tasks, newTask]);
	};

	/*
	// Elimina la tarea cuyo id coincide con el recibido: filtra el array dejando afuera
	// esa tarea y reemplaza el estado con el array resultante (de nuevo, de forma inmutable)
	const deleteTask = (id: number) => {
		const updatedTasks = tasks.filter((task) => task.id !== id);
		setTasks(updatedTasks);
	};
	*/

	// NEW CHANGE: deleteTask now removes the task in the backend using DELETE.
	const deleteTask = async (id: number) => {
		await fetch(`http://localhost:3000/tasks/${id}`, {
			method: "DELETE",
		});
		const updatedTasks = tasks.filter((task) => task.id !== id);
		setTasks(updatedTasks);
	};

	/*
	// Cambia el estado "completed" de una sola tarea (la del id recibido) sin tocar las demás.
	// Recorre todas las tareas con .map: si el id coincide devuelve una copia con "completed"
	// actualizado ({ ...task, completed }), si no coincide devuelve la tarea sin cambios.
	// Así el array resultante tiene una referencia nueva, pero las tareas no afectadas
	// conservan su identidad/contenido original
	const statusUpdateTask = (id: number, completed: boolean) => {
		const updatedTasks = tasks.map((task) => {
			if (task.id === id) {
				return { ...task, completed };
			}
			return task;
		});
		setTasks(updatedTasks);
	};
	*/

	// NEW CHANGE: statusUpdateTask now updates the task in the backend using PUT.
	const statusUpdateTask = async (id: number, completed: boolean) => {
		const response = await fetch(`http://localhost:3000/tasks/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ completed }),
		});
		const updatedTask = await response.json();
		const updatedTasks = tasks.map((task) => (task.id === id ? updatedTask : task));
		setTasks(updatedTasks);
	};

	return (
		<div className="app">
			<Header />
			{/* Le pasamos addTask como prop: TaskInput no toca el estado, solo "avisa" cuándo hay texto nuevo */}
			<TaskInput onAddTask={addTask} />
			{/* Le pasamos la lista de tareas hacia abajo para que la renderice,
			    junto con las funciones para borrar y actualizar el estado de cada tarea */}
			<TaskList tasks={tasks} onDeleteTask={deleteTask} onStatusUpdateTask={statusUpdateTask} />
			{/* Footer no calcula nada por su cuenta: App es la única fuente de verdad de "tasks",
			    así que las cuentas (total/completadas/restantes) se calculan aquí con .filter
			    y se le pasan a Footer ya resueltas, como simples números */}
			<Footer
				tasksTotal={tasks.length}
				tasksCompleted={tasks.filter((t) => t.completed).length}
				tasksRemaining={tasks.filter((t) => !t.completed).length}
			/>
		</div>
	);
}
export default App;
