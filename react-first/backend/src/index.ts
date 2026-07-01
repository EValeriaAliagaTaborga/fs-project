// Importa Express, el framework que convierte Node.js en un servidor HTTP con rutas y middlewares
const express = require("express");

// Crea la instancia de la aplicación Express — es el objeto central que registra rutas y middlewares
const app = express();

// Lee el puerto desde variables de entorno; si no existe, usa 3000 como fallback
const PORT = process.env["PORT"] ?? 3000;

// Define la forma que debe tener cada tarea en TypeScript.
// TypeScript usa este tipo en tiempo de compilación para detectar errores; no existe en runtime.
type Task = {
	id: number;
	text: string;
	completed: boolean;
};

// Base de datos en memoria: un arreglo de tareas que vive mientras el proceso esté corriendo.
// Al reiniciar el servidor, se pierde todo — no hay persistencia real aquí.
const tasks: Task[] = [
    { id: 1, text: "Task 1", completed: false },
    { id: 2, text: "Task 2", completed: false },
    { id: 3, text: "Task 3", completed: false },
];

// Middleware global: le dice a Express que parsee el body de las requests como JSON automáticamente.
// Sin esto, req.body siempre sería undefined en rutas POST/PUT que reciban JSON.
app.use(express.json());

// Ruta de salud (health check): GET / — útil para verificar que el servidor está vivo
app.get("/", (req: any, res: any) => {
	res.send("Backend is working");
});

// GET /tasks — devuelve todas las tareas en formato JSON
app.get("/tasks", (req: any, res: any) => {
    res.json(tasks);
});

// DELETE /tasks/:id — elimina la tarea con el id indicado en la URL
app.delete("/tasks/:id", (req: any, res: any) => {
    // req.params.id llega como string desde la URL, lo convertimos a número para comparar
    const taskId = Number(req.params.id);

    // Busca el índice de la tarea en el arreglo (-1 si no existe)
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
        // splice muta el arreglo original: elimina 1 elemento en la posición encontrada
        tasks.splice(taskIndex, 1);
        res.status(200).json({ message: "Task deleted successfully" });
    } else {
        // Si el id no existe, responde 404 para que el cliente sepa que no encontró el recurso
        res.status(404).json({ message: "Task not found" });
    }
});

// POST /tasks — crea una nueva tarea con el texto recibido en el body JSON
app.post("/tasks", (req: any, res: any) => {
    // Desestructura solo el campo "text" del body; los campos extra se ignoran
    const { text } = req.body;

    // Validación de entrada: si no viene "text", rechazamos con 400 (Bad Request).
    // return corta la función aquí — sin él, el código seguiría ejecutando y crearía una tarea vacía
    if (!text) {
        return res.status(400).json({ message: "Task text is required" });
    }

    const newTask: Task = {
        // Date.now() devuelve los milisegundos desde epoch — suficiente como id único en memoria,
        // pero en una DB real usarías un autoincrement o UUID
        id: Date.now(),
        text,           // shorthand de ES6: equivale a text: text
        completed: false
    };

    // Agrega la nueva tarea al arreglo en memoria
    tasks.push(newTask);

    // 201 Created es el status correcto cuando se crea un recurso nuevo (no 200)
    res.status(201).json(newTask);
});

// PUT /tasks/:id — actualiza parcialmente una tarea existente (solo los campos que vengan en el body)
app.put("/tasks/:id", (req: any, res: any) => {
    const taskId = Number(req.params.id);

    // Desestructura ambos campos editables; cualquiera puede venir como undefined si no se envió
    const { text, completed } = req.body;

    // find devuelve la referencia al objeto dentro del arreglo, no una copia
    // Mutarlo directamente modifica el arreglo original — eso es lo que queremos aquí
    const task = tasks.find((task) => task.id === taskId);

    // Guard temprano: si no existe la tarea, salimos con 404 antes de intentar modificar nada
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    // Solo actualiza el campo si el cliente lo envió — esto permite actualizaciones parciales
    // (ej: enviar solo { completed: true } sin tocar el texto)
    if (text !== undefined) {
        task.text = text;
    }
    if (completed !== undefined) {
        task.completed = completed;
    }

    // Devuelve la tarea ya modificada para que el cliente tenga el estado actualizado
    res.status(200).json(task);
});

// Arranca el servidor y empieza a escuchar conexiones en el puerto definido
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
