// Validaciones puras del formulario de registro (ver Register.tsx).
// Igual que en tareas.ts: mismo input => mismo output, sin efectos secundarios.
// El backend vuelve a validar por su cuenta; estas funciones solo evitan viajes
// innecesarios al servidor y le dan feedback inmediato al usuario.

// Formato mínimo de un correo: algo, una arroba, algo, un punto y algo,
// sin espacios ni arrobas extra en ninguna de las partes.
//
// Corrección del BUG 1: la versión anterior era /^[^\s@]+@[^\s@]+\.[^\s@]+$/ y daba por
// válidos correos como "ana@ejemplo..com", "ana@ejemplo.com." o ".ana@ejemplo.com".
// El motivo era que exigía un punto después de la arroba, pero el punto también entraba
// dentro de [^\s@], así que un segmento vacío alrededor de un punto pasaba sin problema.
//
// La versión nueva excluye el punto del conjunto de caracteres (ahora es [^\s@.]) y lo
// vuelve un separador explícito: cada segmento debe tener al menos un carácter que no sea
// un punto. Leído por partes:
//   [^\s@.]+(?:\.[^\s@.]+)*   parte local: un segmento y, opcionalmente, más separados por puntos
//   @                          exactamente una arroba
//   [^\s@.]+(?:\.[^\s@.]+)+   dominio: igual, pero con al menos un punto obligatorio
const REGEX_CORREO = /^[^\s@.]+(?:\.[^\s@.]+)*@[^\s@.]+(?:\.[^\s@.]+)+$/;

// Se hace trim antes de evaluar porque un espacio pegado al inicio o al final
// es un error de tipeo del usuario, no un correo inválido.
export function esCorreoValido(correo: string): boolean {
	return REGEX_CORREO.test(correo.trim());
}

// Largo mínimo de contraseña. Se exporta para que el mensaje de error de Register
// y las pruebas usen el mismo número y no se desincronicen.
export const LARGO_MINIMO_PASSWORD = 6;

// A diferencia del correo, acá NO se hace trim: un espacio es un carácter válido
// dentro de una contraseña y no debe descartarse silenciosamente.
export function esPasswordValida(password: string): boolean {
	return password.length >= LARGO_MINIMO_PASSWORD;
}