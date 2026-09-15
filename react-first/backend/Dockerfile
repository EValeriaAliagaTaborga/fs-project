FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# prisma.config.ts exige DATABASE_URL incluso para generar el cliente.
# Este valor es de mentira: solo existe durante este RUN y no queda en la imagen.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npm run build

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
