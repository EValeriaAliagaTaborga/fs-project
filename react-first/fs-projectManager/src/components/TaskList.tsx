import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";

// Misma forma que el Task definido en App: describe lo que este componente espera recibir
type Task = {
	id: number;
	text: string;
	completed: boolean;
};

// Este componente no crea ni modifica tareas, solo las recibe para mostrarlas
type TaskListProps = {
	tasks: Task[];
	onDeleteTask: (taskId: number) => void;
	onStatusUpdateTask: (taskId: number, taskCompleted: boolean) => void;
};

function TaskList(props: TaskListProps) {
	const { tasks } = props; // saca "tasks" del objeto de props para no escribir props.tasks

	// Derivamos dos arrays nuevos a partir de "tasks", uno por categoría.
	// No son estado (no usan useState): se recalculan en cada render a partir de tasks,
	// así nunca pueden desincronizarse del array original
	const completedTasks = tasks.filter((task) => task.completed);
	const inProgressTasks = tasks.filter((task) => !task.completed);

	return (
		<div className="task-list-container">
			<h2 className="task-list-title">In progress Tasks List</h2>
			{/* Ternario = expresión, por eso puede ir directo dentro de {}.
                Si el array filtrado quedó vacío, mostramos el mensaje;
                si tiene elementos, mostramos la lista con el .map() */}
			{inProgressTasks.length === 0 ? (
				<EmptyState />
			) : (
				<ul className="task-list">
					{/* Recorre el array y crea un TaskCard por cada tarea.
                    "key" usa el id (no el índice) para que React identifique cada tarea
                    de forma estable aunque la lista cambie de orden o tamaño */}
					{inProgressTasks.map((task) => (
						<TaskCard
							key={task.id}
							task={task}
							onDeleteTask={props.onDeleteTask}
							onStatusUpdateTask={props.onStatusUpdateTask}
						/>
					))}
				</ul>
			)}

			<h2 className="task-list-title">Completed Tasks List</h2>

			{/* Mismo patrón que arriba, pero evaluando el array de tareas completadas */}
			{completedTasks.length === 0 ? (
				<EmptyState />
			) : (
				<ul className="task-list">
					{/* Recorre el array y crea un TaskCard por cada tarea.
                    "key" usa el id (no el índice) para que React identifique cada tarea
                    de forma estable aunque la lista cambie de orden o tamaño */}
					{completedTasks.map((task) => (
						<TaskCard
							key={task.id}
							task={task}
							onDeleteTask={props.onDeleteTask}
							onStatusUpdateTask={props.onStatusUpdateTask}
						/>
					))}
				</ul>
			)}
		</div>
	);
}
export default TaskList;
