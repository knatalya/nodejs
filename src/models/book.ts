// src/models/book.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBook extends Document {
  title: string;
  description: string;
  authors: string;
  favorite: boolean;
  fileCover: string;
  fileName: string;
  fileBook: string;
}

const BookSchema: Schema<IBook> = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    authors: String,
    favorite: { type: Boolean, default: false },
    fileCover: String,
    fileName: String,
    fileBook: String,
  },
  { timestamps: true }
);

const BookModel: Model<IBook> = mongoose.model<IBook>('Book', BookSchema);

export default BookModel;
