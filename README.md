# nodejs
Обновить структуру роутинга проекта с использованием express.Router().

Задание 2
Установить в проект пакет multer и создать middleware для загрузки файла книги. Созданную middleware подключить и обработать в роутах создания данных о книге.

Каждый экземпляр книги должен содержать следующую структуру данных:

{
  id: "string",
  title: "string",
  description: "string",
  authors: "string",
  favorite: bool,
  fileCover: "string",
  fileName: "string",
  fileBook: "string"  //новое поле
}
Задание 3
Создать роут GET: /api/books/:id/download. Метод отдаёт на скачиваение файл книги по её :id.
