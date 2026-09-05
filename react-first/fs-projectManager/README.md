# FS Project Manager

Aplicación web para gestionar una lista de tareas personales: cada persona se registra con nombre, email y contraseña, inicia sesión, y a partir de ahí puede crear, marcar como completadas, editar y eliminar sus tareas. El proyecto es full-stack — un frontend en React + Vite (TypeScript) y una API REST en Express que protege sus rutas con JWT y guarda usuarios y tareas en PostgreSQL mediante Prisma.

<!-- BADGE_CI -->

## 🚀 Instalación local

El repositorio contiene dos aplicaciones: el frontend en `react-first/fs-projectManager` y la API en `react-first/backend`. Hay que instalar ambas.

```bash
git clone https://github.com/EValeriaAliagaTaborga/fs-project.git
cd fs-project/react-first/fs-projectManager
npm install
```

```bash
cd ../backend
npm install
```

Requisitos previos: Node.js 20 o superior y una instancia de PostgreSQL accesible.

### Variables de entorno

Crea un archivo `.env` en la raíz del backend (`react-first/backend`) con las siguientes claves (sin valores reales en este documento):

```
DATABASE_URL=
JWT_SECRET=
PORT=
```

En el repositorio hay un archivo `.env.example` con estas mismas claves vacías y un comentario que explica cada una; puedes copiarlo con `cp .env.example .env` y completar los valores en tu máquina. El archivo `.env` está en `.gitignore` y nunca debe subirse al repositorio.

- `DATABASE_URL` — cadena de conexión a PostgreSQL, con el formato `postgresql://usuario:password@host:puerto/nombre_db?schema=public`.
- `JWT_SECRET` — cadena larga y aleatoria con la que se firman y verifican los tokens de sesión. Si falta, el servidor no arranca. Puedes generar una con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `PORT` — puerto en el que escucha la API. Si se omite, se usa `3000`, que es el valor que el frontend espera.

#### Variables del frontend

El frontend tiene además su propio archivo `.env` **opcional** en `react-first/fs-projectManager`, con una sola clave:

```
VITE_API_URL=
```

Es la URL base de la API. Si no se define, se usa `http://localhost:3000`, así que en desarrollo local no hace falta crear este archivo; solo es necesario cuando el backend corre en otro host o puerto (por ejemplo al desplegar). También hay un `.env.example` en esa carpeta.

> Vite expone al navegador únicamente las variables cuyo nombre empieza con `VITE_`, y las incrusta en el bundle en tiempo de build. Por eso aquí no deben guardarse secretos: cualquiera que abra la app puede leerlas. Las claves sensibles (`DATABASE_URL`, `JWT_SECRET`) viven solo en el `.env` del backend, que nunca llega al navegador.

### Preparar la base de datos y levantar el proyecto

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

## 📜 Comandos disponibles

| Comando          | Descripción                              |
|------------------|-------------------------------------------|
| `npm run dev`    | Levanta el entorno de desarrollo           |
| `npm run build`  | Genera el build de producción              |
| `npm test`       | Corre las pruebas automatizadas (pendiente — Sesión 3) |

Los tres comandos existen tanto en el frontend como en el backend. `npm test` todavía no ejecuta ninguna prueba: imprime un aviso de que están pendientes y termina sin error, para que el pipeline de la Sesión 2 pueda invocarlo mientras las pruebas reales se construyen en la Sesión 3.

Comandos adicionales del backend:

| Comando              | Descripción                                        |
|----------------------|----------------------------------------------------|
| `npm start`          | Ejecuta el build compilado (`dist/src/index.js`)   |
| `npm run db:migrate` | Aplica las migraciones de Prisma                   |
| `npm run db:seed`    | Carga los datos de ejemplo                         |

Y del frontend:

| Comando           | Descripción                                  |
|-------------------|----------------------------------------------|
| `npm run lint`    | Revisa el código con ESLint                  |
| `npm run preview` | Sirve localmente el build de producción      |

## 🗄️ Base de datos

PostgreSQL con migraciones y seeds gestionados con Prisma (ver Módulo 2).

El esquema (`react-first/backend/prisma/schema.prisma`) define dos modelos: `User` (nombre, email único y contraseña hasheada con bcrypt) y `Task` (texto, estado completado y fecha de creación). Las migraciones viven en `prisma/migrations` y el seed en `prisma/seed.ts`; el seed es idempotente, así que puede correrse varias veces sin duplicar datos.
