import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Атрибуты, необходимые для создания/обновления книги
 */
export interface IBookInput {
  title: string;
  description?: string;
  authors?: string;
  favorite?: boolean;
  fileCover?: string;
  fileName?: string;
  fileBook?: string;
}

/**
 * Интерфейс документа книги в MongoDB (добавляет поля mongoose.Document и timestamps)
 */
export interface IBookDocument extends Document, IBookInput {
  createdAt: Date;
  updatedAt: Date;
}

interface IBookModel extends Model<IBookDocument> {
  build(attrs: IBookInput): IBookDocument;
}

const BookSchema = new Schema<IBookDocument, IBookModel>(
  {
    title:      { type: String,  required: true },
    description:{ type: String,  default: '' },
    authors:    { type: String,  default: '' },
    favorite:   { type: Boolean, default: false },
    fileCover:  { type: String,  default: '' },
    fileName:   { type: String,  default: '' },
    fileBook:   { type: String,  default: '' },
  },
  { timestamps: true }
);

// Фабрика через this для корректного this-контекста модели
BookSchema.statics.build = function(attrs: IBookInput) {
  return new this(attrs);
};

const BookModel = mongoose.model<IBookDocument, IBookModel>('Book', BookSchema);

export default BookModel;