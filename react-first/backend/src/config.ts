// Configuración de servicios externos. El valor real vive en .env (local)
// o en GitHub Secrets (pipeline), nunca en el código.
export const apiKey = process.env["API_KEY"]