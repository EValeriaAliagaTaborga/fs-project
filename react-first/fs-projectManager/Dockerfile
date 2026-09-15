# Etapa 1: construir la aplicación
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: servir los archivos estáticos
FROM nginx:alpine

# Sin esta configuración, recargar una ruta de React Router (/login, /profile) da 404
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
