// Este archivo se ejecuta una vez antes de cada archivo de prueba (ver setupFiles en vite.config.js).
// Importa la variante "/vitest" del paquete, no la raíz: además de registrar los matchers extra
// (toBeInTheDocument, toHaveValue, toBeDisabled...), esa variante declara los tipos sobre el
// módulo "vitest". La raíz del paquete los declara sobre "jest", que es un motor distinto,
// y por eso el editor marcaba toHaveValue como inexistente aunque la prueba pasara.
import "@testing-library/jest-dom/vitest";
