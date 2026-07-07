import Header from "./Header";
import TaskList from "./TaskList";
import Footer from "./Footer";
import TaskInput from "./TaskInput";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authHeader, TOKEN_KEY } from "../api/auth";

// Forma de cada tarea en la lista: el "contrato" de datos que comparten todos los componentes
type Task = {
	id: number; // identificador único, se usa como key en las listas
	text: string; // el texto visible de la tarea
	completed: boolean; // si la tarea ya fue marcada como hecha
};

function TaskManager() {
	// Estado central: la lista de tareas. TaskManager es la "fuente de verdad", los demás componentes
	// solo reciben esta lista por props, nunca la modifican directamente
	const [tasks, setTasks] = useState<Task[]>([]);
	const navigate = useNavigate();

	// Carga las tareas desde el backend cuando el componente se monta
	useEffect(() => {
		const fetchTasks = async () => {
			const response = await fetch("http://localhost:3000/tasks", {
				headers: { ...authHeader() },
			});
			const data = await response.json();
			setTasks(data);
		};
		fetchTasks();
	}, []);

	// Crea una tarea nueva enviándola al backend usando POST
	const addTask = async (text: string) => {
		const response = await fetch("http://localhost:3000/tasks", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...authHeader(),
			},
			body: JSON.stringify({
				text: text,
			}),
		});
		const newTask = await response.json();
		setTasks([...tasks, newTask]);
	};

	// Elimina la tarea en el backend usando DELETE
	const deleteTask = async (id: number) => {
		await fetch(`http://localhost:3000/tasks/${id}`, {
			method: "DELETE",
			headers: { ...authHeader() },
		});
		const updatedTasks = tasks.filter((task) => task.id !== id);
		setTasks(updatedTasks);
	};

	// Actualiza el estado "completed" de una tarea en el backend usando PUT
	const statusUpdateTask = async (id: number, completed: boolean) => {
		const response = await fetch(`http://localhost:3000/tasks/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				...authHeader(),
			},
			body: JSON.stringify({ completed }),
		});
		const updatedTask = await response.json();
		const updatedTasks = tasks.map((task) => (task.id === id ? updatedTask : task));
		setTasks(updatedTasks);
	};

	// Este componente solo se llega a renderizar dentro de ProtectedRoute, es decir que ya hay
	// un token válido guardado. Cerrar sesión simplemente borra ese token: la próxima vez que
	// ProtectedRoute se monte (por ejemplo si el usuario intenta volver a /profile) no va a
	// encontrar token y va a redirigir a /login.
	const handleLogout = () => {
		localStorage.removeItem(TOKEN_KEY);
		navigate("/login");
	};

	return (
		<div className="app">
			<Header />
			<div className="logout-bar">
				<button className="logout-btn" onClick={handleLogout}>
					Cerrar sesión
				</button>
			</div>
			{/* Le pasamos addTask como prop: TaskInput no toca el estado, solo "avisa" cuándo hay texto nuevo */}
			<TaskInput onAddTask={addTask} />
			{/* Le pasamos la lista de tareas hacia abajo para que la renderice,
			    junto con las funciones para borrar y actualizar el estado de cada tarea */}
			<TaskList tasks={tasks} onDeleteTask={deleteTask} onStatusUpdateTask={statusUpdateTask} />
			{/* Footer no calcula nada por su cuenta: TaskManager es la única fuente de verdad de "tasks",
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

export default TaskManager;
