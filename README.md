# nodejs
Разработать API CRUD для работы с сущностью «книга». Каждый экземпляр книги должен содержать следующую структуру данных:

{
  id: "string",
  title: "string",
  description: "string",
  authors: "string",
  favorite: "string",
  fileCover: "string",
  fileName: "string"
}

Метод	URL	Действие	Комментарий
POST	/api/user/login	авторизация пользователя	метод всегда возвращает Code: 201 и статичный объект: { id: 1, mail: "test@mail.ru" }
GET	/api/books	получить все книги	получаем массив всех книг
GET	/api/books/:id	получить книгу по ID	получаем объект книги, если запись не найдена, вернём Code: 404
POST	/api/books	создать книгу	создаём книгу и возвращаем её же вместе с присвоенным ID
PUT	/api/books/:id	редактировать книгу по ID	редактируем объект книги, если запись не найдена, вернём Code: 404
DELETE	/api/books/:id	удалить книгу по ID	удаляем книгу и возвращаем ответ: 'ok'
