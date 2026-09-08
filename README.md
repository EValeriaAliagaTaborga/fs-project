# FS Project Manager

Aplicación full-stack para gestionar una lista de tareas personales: cada persona se registra con nombre, email y contraseña, inicia sesión, y a partir de ahí puede crear, marcar como completadas, editar y eliminar sus tareas.

El repositorio contiene dos aplicaciones que se ejecutan por separado:

| Carpeta | Aplicación | Stack |
|---------|-----------|-------|
| [`react-first/fs-projectManager`](react-first/fs-projectManager) | Frontend web | React + Vite (TypeScript) |
| [`react-first/backend`](react-first/backend) | API REST | Node.js, Express, TypeScript, Prisma, PostgreSQL |

La API protege sus rutas con tokens JWT y guarda usuarios y tareas en PostgreSQL mediante Prisma; el frontend la consume desde el navegador.

<!-- BADGE_CI -->

## 📁 Estructura del repositorio

```
fs-project/
└── react-first/
    ├── backend/            → API REST (Express + Prisma)
    │   ├── prisma/         → esquema, migraciones y seed
    │   └── src/            → código de la API
    └── fs-projectManager/  → frontend (React + Vite)
        └── src/            → componentes, vistas y cliente HTTP
```

Cada carpeta tiene su propio README con el detalle completo:

- **[README del backend](react-first/backend/README.md)** — variables de entorno, tabla de endpoints, modelos de Prisma y notas sobre el cliente generado.
- **[README del frontend](react-first/fs-projectManager/README.md)** — instalación conjunta, variables `VITE_*` y comandos de la app web.

## 🚀 Instalación local

Requisitos previos: Node.js 20 o superior y una instancia de PostgreSQL accesible.

Hay que instalar las dos aplicaciones:

```bash
git clone https://github.com/EValeriaAliagaTaborga/fs-project.git

cd fs-project/react-first/backend
npm install

cd ../fs-projectManager
npm install
```

### Variables de entorno

El **backend** necesita un `.env` en `react-first/backend` con tres claves:

```
DATABASE_URL=
JWT_SECRET=
PORT=
```

- `DATABASE_URL` — cadena de conexión a PostgreSQL (`postgresql://usuario:password@host:puerto/nombre_db?schema=public`).
- `JWT_SECRET` — cadena larga y aleatoria con la que se firman los tokens de sesión. Si falta, el servidor no arranca. Puedes generar una con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `PORT` — puerto en el que escucha la API. Si se omite, se usa `3000`, que es el valor que el frontend espera.

El **frontend** tiene un `.env` opcional en `react-first/fs-projectManager` con una sola clave, `VITE_API_URL`, que apunta a la API. Si no se define se usa `http://localhost:3000`, así que en desarrollo local no hace falta crearlo.

Ambas carpetas incluyen un `.env.example` con las claves vacías y un comentario por cada una: basta con `cp .env.example .env` y completar los valores. Los archivos `.env` están en `.gitignore` y nunca deben subirse al repositorio.

> Vite incrusta las variables `VITE_*` en el bundle en tiempo de build, así que son visibles para cualquiera que abra la app. Los secretos (`DATABASE_URL`, `JWT_SECRET`) viven solo en el `.env` del backend, que nunca llega al navegador.

### Levantar el proyecto

Desde `react-first/backend`, con el `.env` ya completo:

```bash
npm run db:migrate   # aplica las migraciones de Prisma y genera el cliente
npm run db:seed      # carga un usuario y unas tareas de ejemplo (opcional)
npm run dev          # API en http://localhost:3000
```

Y en otra terminal, desde `react-first/fs-projectManager`:

```bash
npm run dev          # frontend en http://localhost:5173
```

Para comprobar que la API quedó arriba: `curl http://localhost:3000/` responde `Backend is working`.

## 📜 Comandos disponibles

Estos tres comandos existen en ambas aplicaciones:

| Comando          | Descripción                                            |
|------------------|--------------------------------------------------------|
| `npm run dev`    | Levanta el entorno de desarrollo                       |
| `npm run build`  | Genera el build de producción                          |
| `npm test`       | Corre las pruebas automatizadas (pendiente — Sesión 3) |

`npm test` todavía no ejecuta ninguna prueba: imprime un aviso de que están pendientes y termina sin error, para que el pipeline de la Sesión 2 pueda invocarlo mientras las pruebas reales se construyen en la Sesión 3.

Comandos adicionales del backend:

| Comando              | Descripción                                                  |
|----------------------|--------------------------------------------------------------|
| `npm start`          | Ejecuta el build compilado (`dist/src/index.js`)             |
| `npm run db:migrate` | Aplica las migraciones de Prisma y regenera el cliente        |
| `npm run db:seed`    | Carga los datos de ejemplo definidos en `prisma/seed.ts`      |

Y del frontend:

| Comando           | Descripción                             |
|-------------------|-----------------------------------------|
| `npm run lint`    | Revisa el código con ESLint             |
| `npm run preview` | Sirve localmente el build de producción |

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

El esquema (`react-first/backend/prisma/schema.prisma`) define dos modelos: `User` (nombre, email único y contraseña hasheada con bcrypt) y `Task` (texto, estado completado y fecha de creación). Las migraciones viven en `prisma/migrations` y el seed en `prisma/seed.ts`; el seed es idempotente, así que puede correrse varias veces sin duplicar datos.

Prisma no se consume desde `node_modules`: el cliente se genera como código dentro del proyecto, en `react-first/backend/src/generated/`. Esa carpeta está en `.gitignore` porque es código generado y se reconstruye a partir del esquema, así que en un clon nuevo no existe todavía. La crean tanto `npm run build` como `npm run db:migrate`, y cualquiera de los dos hay que correrlo antes de `npm start`; `npm run dev` también falla si la carpeta no está.
