# Dockerfile для counter-service
FROM node:18-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .

# Папка для хранения данных
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 4000
CMD ["node", "counter.js"]
