# Dockerfile для приложения "Библиотека"
FROM node:18-alpine

# Рабочая директория внутри контейнера
WORKDIR /usr/src/app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install --production

# Копируем остальной исходный код
COPY . .

# Открываем порт
EXPOSE 3000

# Команда запуска
CMD ["node", "server.js"]