# Servidor de desarrollo de Vite: para la feria basta, y evita montar un nginx
# solo para servir estáticos.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
