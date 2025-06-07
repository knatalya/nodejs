# Используем официальный Node.js образ (например, 18-й LTS)
FROM node:18-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json сначала, чтобы закешировать зависимости
COPY package*.json ./

# Устанавливаем production-зависимости
RUN npm ci --only=production

# Копируем весь исходный код
COPY . .

# Создаём папку uploads и устанавливаем права
RUN mkdir -p /usr/src/app/uploads && chown -R node:node /usr/src/app/uploads

# Переключаемся на небезопасного пользователя (не root)
USER node

# Порт, на котором приложение слушает (подставьте ваше значение из .env или 3000)
EXPOSE 3000

# Команда для запуска
CMD ["npm", "start"]
