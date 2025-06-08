# Инструкция по запуску и использованию

## 🛠️ Подготовка окружения

1. **Клонируйте репозиторий** и перейдите в папку проекта:

   ```bash
   git clone <repo-url>
   cd DIPLOM
   ```

2. **Скопируйте пример файла окружения** и заполните его:

   ```bash
   cp .env-example .env
   ```

   В файле `.env` укажите реальные значения:

   ```dotenv
   HTTP_HOST=0.0.0.0           # Хост для прослушивания
   HTTP_PORT=3000              # Порт приложения
   MONGO_URL=mongodb://localhost:27017/hotels-db  # URL MongoDB

   JWT_SECRET=<ваш_JWT_секрет>         # любая надёжная строка
   SESSION_SECRET=<ваш_секрет_сессий>  # любая надёжная строка

   ADMIN_EMAIL=admin@example.com       # учётные данные для admin
   ADMIN_PASSWORD=securePass123        # пароль для admin
   ```

   * **Генерация секретов** (PowerShell):

     ```powershell
     [Convert]::ToBase64String((New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))
     ```

3. **Установите зависимости**:

   ```bash
   npm install
   ```

---

## 🚀 Локальный запуск

1. **Запустите MongoDB**:

   * Локально: команда `mongod`, либо служба Mongo.
   * Через Docker:

     ```bash
     docker-compose up -d mongo
     ```

2. **Запустите приложение** в режиме разработки:

   ```bash
   npm run start:dev
   ```

3. **Откройте Swagger UI** для документации и тестирования API:

   ```
   http://localhost:3000/docs
   ```

---

## 🔧 Создание администратора

Для создания admin-пользователя выполните:

```bash
npm run seed:admin
```

Вы увидите в консоли:

```
Admin user created: <ADMIN_EMAIL>
```

---

## ✅ Тестирование

* **E2E-тесты**:

  ```bash
  npm run test:e2e
  ```

  *(MongoDB и приложение должны быть запущены.)*

* **Unit-тесты** (если есть):

  ```bash
  npm run test
  ```

---

## 📦 Запуск через Docker

1. **Соберите и запустите контейнеры**:

   ```bash
   docker-compose up --build
   ```

2. **Контейнеры**:

   * `app`  — приложение NestJS
   * `mongo` — MongoDB

3. **Проверьте статус и логи**:

   ```bash
   docker ps
   docker logs <container_name>
   ```

---

## 🔍 Основные эндпоинты

### Аутентификация

* `POST /api/client/register` — регистрация клиента
* `POST /api/auth/login` — аутентификация, возвращает `{ access_token }`
* `POST /api/auth/logout` — выход (для сессий)

### Клиент (role = client)

* `GET /api/common/hotel-rooms` — поиск доступных номеров
* `GET /api/common/hotel-rooms/:id` — детали номера
* `POST /api/client/reservations` — создать бронь
* `GET /api/client/reservations` — список своих броней
* `DELETE /api/client/reservations/:id` — отмена брони
* `POST /api/client/support-requests` — создать запрос в поддержку
* `GET /api/client/support-requests` — список своих запросов

### Администратор (role = admin)

* `POST /api/admin/users` — создать пользователя
* `GET /api/admin/users` — список пользователей
* `POST /api/admin/hotels` — добавить гостиницу
* `GET /api/admin/hotels` — список гостиниц
* `PUT /api/admin/hotels/:id` — обновить гостиницу
* `POST /api/admin/hotel-rooms` — добавить номер
* `PUT /api/admin/hotel-rooms/:id` — обновить номер и изображения

### Менеджер (role = manager)

* `GET /api/manager/users` — список пользователей
* `GET /api/manager/reservations/:userId` — бронь конкретного пользователя
* `DELETE /api/manager/reservations/:id` — отмена брони
* `GET /api/manager/support-requests` — все запросы в поддержку

### Общие (client & manager)

* `GET /api/common/support-requests/:id/messages` — история сообщений
* `POST /api/common/support-requests/:id/messages` — отправить сообщение
* `POST /api/common/support-requests/:id/messages/read` — отметить прочитанными

### WebSocket (Support)

* **URL**: `ws://localhost:3000/support`
* **Подписка**:

  ```js
  socket.emit('subscribeToChat', '<requestId>');
  ```
* **Событие новых сообщений**:

  ```js
  socket.on('newMessage', handler);
  ```

Теперь вы готовы к запуску и тестированию всего функционала!
