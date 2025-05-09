// models/book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  authors:     { type: String, default: '' },
  favorite:    { type: Boolean, default: false },
  fileCover:   { type: String, default: '' },
  fileName:    { type: String, default: '' },
  fileBook:    { type: String, default: '' },       // если нужен файл с книгой
}, {
  timestamps: true,  // добавит createdAt, updatedAt
});

// виртуальный id из _id
bookSchema.virtual('id').get(function(){
  return this._id.toHexString();
});
bookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
