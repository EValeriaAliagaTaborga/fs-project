import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TaskInput from "./TaskInput";

// A diferencia de las pruebas de utils/, acá no se prueba una función suelta sino un
// componente renderizado en un DOM simulado (jsdom). La prueba interactúa como lo haría
// una persona: busca el campo por su etiqueta, escribe y hace click; nunca inspecciona
// el estado interno del componente ni sus clases CSS.
describe("TaskInput", () => {
	it("llama a onAddTask con el texto escrito por el usuario", async () => {
		// Arrange: vi.fn() crea una función "espía" que registra con qué argumentos la llamaron.
		// Reemplaza a la función real de TaskManager, así la prueba no toca el backend.
		const onAddTask = vi.fn();
		render(<TaskInput onAddTask={onAddTask} />);
		const usuario = userEvent.setup();

		// Act
		const input = screen.getByLabelText("New task");
		await usuario.type(input, "Comprar pan");
		await usuario.click(screen.getByText("Add Task"));

		// Assert
		expect(onAddTask).toHaveBeenCalledWith("Comprar pan");
		expect(onAddTask).toHaveBeenCalledTimes(1);
	});

	it("no llama a onAddTask si el campo está vacío", async () => {
		const onAddTask = vi.fn();
		render(<TaskInput onAddTask={onAddTask} />);
		const usuario = userEvent.setup();

		await usuario.click(screen.getByText("Add Task"));

		expect(onAddTask).not.toHaveBeenCalled();
	});

	it("no llama a onAddTask si el campo solo tiene espacios", async () => {
		const onAddTask = vi.fn();
		render(<TaskInput onAddTask={onAddTask} />);
		const usuario = userEvent.setup();

		await usuario.type(screen.getByLabelText("New task"), "   ");
		await usuario.click(screen.getByText("Add Task"));

		expect(onAddTask).not.toHaveBeenCalled();
	});

	it("recorta los espacios sobrantes antes de avisarle al padre", async () => {
		const onAddTask = vi.fn();
		render(<TaskInput onAddTask={onAddTask} />);
		const usuario = userEvent.setup();

		await usuario.type(screen.getByLabelText("New task"), "  Comprar pan  ");
		await usuario.click(screen.getByText("Add Task"));

		expect(onAddTask).toHaveBeenCalledWith("Comprar pan");
	});

	it("limpia el campo después de agregar una tarea", async () => {
		// Arrange
		const onAddTask = vi.fn();
		render(<TaskInput onAddTask={onAddTask} />);
		const usuario = userEvent.setup();
		const input = screen.getByLabelText("New task");

		// Act
		await usuario.type(input, "Comprar pan");
		await usuario.click(screen.getByText("Add Task"));

		// Assert: toHaveValue es uno de los matchers extra que aporta jest-dom (ver src/test/setup.ts)
		expect(input).toHaveValue("");
	});

	it("también agrega la tarea al presionar Enter dentro del campo", async () => {
		// Esto funciona porque el componente es un <form> con onSubmit y no un botón suelto:
		// enviar con Enter es comportamiento nativo del formulario, no código extra.
		const onAddTask = vi.fn();
		render(<TaskInput onAddTask={onAddTask} />);
		const usuario = userEvent.setup();

		await usuario.type(screen.getByLabelText("New task"), "Comprar pan{Enter}");

		expect(onAddTask).toHaveBeenCalledWith("Comprar pan");
	});
});
