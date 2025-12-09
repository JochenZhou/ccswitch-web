FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3001 4173

CMD ["sh", "-c", "node server/index.js & npm run preview -- --host"]
