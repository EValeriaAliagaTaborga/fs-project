import { describe, it, expect } from "vitest";
import { esCorreoValido, esPasswordValida, LARGO_MINIMO_PASSWORD } from "./validaciones";

describe("esCorreoValido", () => {
	it("acepta un correo con formato válido", () => {
		// Arrange
		const correo = "ana@ejemplo.com";
		// Act
		const resultado = esCorreoValido(correo);
		// Assert
		expect(resultado).toBe(true);
	});

	it("rechaza un correo sin arroba", () => {
		const correo = "ana-ejemplo.com";
		const resultado = esCorreoValido(correo);
		expect(resultado).toBe(false);
	});

	it("rechaza un correo sin dominio después de la arroba", () => {
		expect(esCorreoValido("ana@")).toBe(false);
	});

	it("rechaza un correo sin punto en el dominio", () => {
		expect(esCorreoValido("ana@ejemplo")).toBe(false);
	});

	it("rechaza una cadena vacía", () => {
		expect(esCorreoValido("")).toBe(false);
	});

	it("acepta un correo con espacios al inicio o al final", () => {
		// El trim de la función perdona errores de tipeo al copiar y pegar
		expect(esCorreoValido("  ana@ejemplo.com  ")).toBe(true);
	});

	it("rechaza un correo con un espacio en el medio", () => {
		expect(esCorreoValido("ana perez@ejemplo.com")).toBe(false);
	});
});

describe("esPasswordValida", () => {
	it("acepta una contraseña con el largo mínimo exacto", () => {
		// Arrange: se construye a partir de la constante para que el test no se rompa
		// si mañana se cambia el largo mínimo
		const password = "a".repeat(LARGO_MINIMO_PASSWORD);
		// Act
		const resultado = esPasswordValida(password);
		// Assert
		expect(resultado).toBe(true);
	});

	it("rechaza una contraseña más corta que el mínimo", () => {
		const password = "a".repeat(LARGO_MINIMO_PASSWORD - 1);
		expect(esPasswordValida(password)).toBe(false);
	});

	it("rechaza una cadena vacía", () => {
		expect(esPasswordValida("")).toBe(false);
	});

	it("no descarta los espacios: son caracteres válidos dentro de una contraseña", () => {
		expect(esPasswordValida("ab cd ef")).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// BUG 1 (función pura): esCorreoValido acepta un caso que no debería.
//
// La regex actual, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, exige que haya "al menos un punto
// después de la arroba", pero trata al punto como un carácter cualquiera: no comprueba
// que las partes separadas por puntos no estén vacías. Por eso da por válidos correos
// con dos puntos seguidos, con el dominio terminado en punto, o con la parte local
// empezando en punto: en los tres casos hay un segmento vacío, y ninguna de esas
// direcciones existe.
//
// Estas pruebas describen el comportamiento ESPERADO, no el actual: hoy fallan a
// propósito y deben quedar en verde una vez corregida la función.
// ---------------------------------------------------------------------------
describe("esCorreoValido - segmentos vacíos alrededor de los puntos (BUG 1)", () => {
	it("rechaza un dominio con dos puntos seguidos", () => {
		// Arrange
		const correo = "ana@ejemplo..com";
		// Act
		const resultado = esCorreoValido(correo);
		// Assert
		expect(resultado).toBe(false);
	});

	it("rechaza un dominio que termina en punto", () => {
		expect(esCorreoValido("ana@ejemplo.com.")).toBe(false);
	});

	it("rechaza una parte local que empieza con punto", () => {
		expect(esCorreoValido(".ana@ejemplo.com")).toBe(false);
	});

	// Contraparte de las tres anteriores: al endurecer la regla hay que asegurarse de no
	// haberse pasado de estricto. El punto sigue siendo válido cuando separa segmentos reales.
	it("sigue aceptando puntos que separan segmentos no vacíos", () => {
		expect(esCorreoValido("ana.perez@ejemplo.com")).toBe(true);
		expect(esCorreoValido("ana@sub.ejemplo.com")).toBe(true);
	});
});
