// Ya no es solo "text": ahora TaskCard necesita el id (para identificar a qué tarea
// le pasa los eventos hacia arriba) y las dos funciones que App expone para
// borrar tareas o cambiar su estado de completado
type Task = {
	id: number;
	text: string;
	completed: boolean;
};

type TaskCardProps = {
	task: Task;
	onDeleteTask: (taskId: number) => void, // le pide al padre que borre esta tarea
	onStatusUpdateTask: (taskId: number, taskCompleted: boolean) => void, // le pide al padre que actualice el estado "completed"
};

function TaskCard(props: TaskCardProps) {
	return (
		<li className="task-item">
			<div className="task-content">
				<p>
					<img
						className="task-icon"
						src="..\src\assets\heart-icon-3351.png"
						alt="Task icon"
						width="20"
						height="20"
					/>
					{props.task.text /* el texto recibido desde TaskList, originado en App */}
				</p>
			</div>
			<div>
				{/* Al hacer click, TaskCard no borra nada por sí mismo: solo llama a la función
				    que le pasó App (vía TaskList), indicándole el id de esta tarea en particular */}
				<button className="delete-button" onClick={() => props.onDeleteTask(props.task.id)}>
					X
				</button>
			</div>
			<div>
				{/* Checkbox controlado: "checked" refleja el estado real (props.completed),
				    nunca el propio estado interno del checkbox. Al tildarlo/destildarlo,
				    avisa hacia arriba con el nuevo valor (e.target.checked) para que App
				    actualice esa tarea en particular */}
				<input type="checkbox" className="task-checkbox" checked={props.task.completed} onChange={(e) => props.onStatusUpdateTask(props.task.id, e.target.checked)} />
			</div>
		</li>
	);
}
export default TaskCard;
