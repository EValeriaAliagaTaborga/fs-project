// Seed: carga datos iniciales en PostgreSQL para poder probar la app recién clonada.
// Se ejecuta con `npm run db:seed` (ver prisma.config.ts, que apunta a este archivo).
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

async function main() {
	// upsert en vez de create: así el seed se puede correr varias veces sin duplicar
	// el usuario ni fallar por el índice único del email.
	const email = "demo@fsprojectmanager.local";
	const password = await bcrypt.hash("demo1234", 10);
	const user = await prisma.user.upsert({
		where: { email },
		update: {},
		create: { name: "Usuario Demo", email, password },
	});
	console.log(`Usuario de prueba listo: ${user.email} (password: demo1234)`);

	// Las tareas no tienen campo único, así que solo se insertan si la tabla está vacía;
	// de lo contrario cada corrida del seed agregaría copias.
	const existingTasks = await prisma.task.count();
	if (existingTasks === 0) {
		await prisma.task.createMany({
			data: [
				{ text: "Configurar el archivo .env", completed: true },
				{ text: "Correr las migraciones de Prisma", completed: true },
				{ text: "Levantar el frontend con npm run dev", completed: false },
			],
		});
		console.log("Tareas de ejemplo creadas");
	} else {
		console.log(`La tabla Task ya tiene ${existingTasks} filas: no se insertan ejemplos`);
	}
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
