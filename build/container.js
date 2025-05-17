"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
// src/container.ts
require("reflect-metadata");
const inversify_1 = require("inversify");
const BooksRepository_1 = require("./repositories/BooksRepository");
const BooksRepositoryImpl_1 = require("./repositories/BooksRepositoryImpl");
// Создаём IoC-контейнер
exports.container = new inversify_1.Container();
// Привязываем абстракцию к реализации
exports.container
    .bind(BooksRepository_1.BooksRepository)
    .to(BooksRepositoryImpl_1.BooksRepositoryImpl)
    .inSingletonScope();
