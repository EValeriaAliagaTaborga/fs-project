# FS Project Manager — API

API REST que da soporte a FS Project Manager, una aplicación de gestión de tareas personales. Este servicio se encarga de registrar usuarios, autenticarlos con tokens JWT y guardar sus tareas en PostgreSQL; la interfaz web que lo consume vive en la carpeta vecina `fs-projectManager`. Está construido con Node.js, Express y TypeScript, y accede a la base de datos mediante Prisma.

<!-- BADGE_CI -->

## 🚀 Instalación local

```bash
git clone https://github.com/EValeriaAliagaTaborga/fs-project.git
cd fs-project/react-first/backend
npm install
```

Requisitos previos: Node.js 20 o superior y una instancia de PostgreSQL accesible.

### Variables de entorno

Crea un archivo `.env` en la raíz con las siguientes claves (sin valores reales en este documento):

```
DATABASE_URL=
JWT_SECRET=
PORT=
```

El repositorio incluye un `.env.example` con estas mismas claves vacías y un comentario que explica cada una, así que basta con `cp .env.example .env` y completar los valores en tu máquina. El archivo `.env` está en `.gitignore` y nunca debe subirse al repositorio.

- `DATABASE_URL` — cadena de conexión a PostgreSQL, con el formato `postgresql://usuario:password@host:puerto/nombre_db?schema=public`.
- `JWT_SECRET` — cadena larga y aleatoria con la que se firman y verifican los tokens de sesión. Si falta, el servidor no arranca. Puedes generar una con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `PORT` — puerto en el que escucha la API. Si se omite, se usa `3000`.

> Si cambias `PORT`, el frontend deja de encontrar la API: hay que apuntarlo al nuevo puerto definiendo `VITE_API_URL` en el `.env` de `react-first/fs-projectManager` (ver el README de esa carpeta). Con el valor por defecto `3000` no hace falta configurar nada.

### Preparar la base de datos y levantar la API

Con el `.env` ya completo:

```bash
npm run db:migrate   # aplica las migraciones de Prisma y genera el cliente
npm run db:seed      # carga un usuario y unas tareas de ejemplo (opcional)
npm run dev          # API en http://localhost:3000
```

Para comprobar que quedó arriba: `curl http://localhost:3000/` responde `Backend is working`.

## 📜 Comandos disponibles

| Comando          | Descripción                              |
|------------------|-------------------------------------------|
| `npm run dev`    | Levanta el entorno de desarrollo           |
| `npm run build`  | Genera el build de producción              |
| `npm test`       | Corre las pruebas automatizadas (pendiente — Sesión 3) |

`npm test` todavía no ejecuta ninguna prueba: imprime un aviso de que están pendientes y termina sin error, para que el pipeline de la Sesión 2 pueda invocarlo mientras las pruebas reales se construyen en la Sesión 3.

Comandos adicionales:

| Comando              | Descripción                                                  |
|----------------------|--------------------------------------------------------------|
| `npm start`          | Ejecuta el build compilado (`dist/src/index.js`)             |
| `npm run db:migrate` | Aplica las migraciones de Prisma y regenera el cliente        |
| `npm run db:seed`    | Carga los datos de ejemplo definidos en `prisma/seed.ts`      |

## 🔌 Endpoints

Las rutas de `/tasks` y `/profile` exigen la cabecera `Authorization: Bearer <token>`, donde el token es el que devuelve `POST /login`.

| Método   | Ruta         | Autenticación | Descripción                                  |
|----------|--------------|---------------|----------------------------------------------|
| `GET`    | `/`          | No            | Health check: responde `Backend is working`  |
| `POST`   | `/register`  | No            | Crea un usuario (la contraseña se hashea)    |
| `POST`   | `/login`     | No            | Valida credenciales y devuelve un JWT de 1 h |
| `GET`    | `/profile`   | Sí            | Devuelve los datos del token en uso          |
| `GET`    | `/tasks`     | Sí            | Lista las tareas                             |
| `POST`   | `/tasks`     | Sí            | Crea una tarea                               |
| `PUT`    | `/tasks/:id` | Sí            | Actualiza el texto o el estado de una tarea  |
| `DELETE` | `/tasks/:id` | Sí            | Elimina una tarea                            |

## 🗄️ Base de datos

PostgreSQL con migraciones y seeds gestionados con Prisma (ver Módulo 2).

El esquema (`prisma/schema.prisma`) define dos modelos: `User` (nombre, email único y contraseña hasheada con bcrypt) y `Task` (texto, estado completado y fecha de creación). Las migraciones viven en `prisma/migrations` y el seed en `prisma/seed.ts`; el seed es idempotente, así que puede correrse varias veces sin duplicar datos.

Prisma no se consume desde `node_modules`: el cliente se genera como código dentro del proyecto, en `src/generated/`. Esa carpeta está en `.gitignore` porque es código generado y se reconstruye a partir del esquema, así que en un clon nuevo no existe todavía. La crean tanto `npm run build` como `npm run db:migrate`, y cualquiera de los dos comandos hay que correrlo antes de `npm start`; `npm run dev` también falla si la carpeta no está.
