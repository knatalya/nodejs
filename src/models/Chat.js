// src/models/Chat.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Схема для Message (вложенная в Chat)
const messageSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    _id: true // сообщению нужен собственный _id
  }
);

const chatSchema = new Schema(
  {
    users: {
      type: [Schema.Types.ObjectId], // массив из двух ObjectId
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length === 2,
        'Users array must contain exactly 2 user IDs'
      ]
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    messages: {
      type: [messageSchema],
      default: []
    }
  },
  {
    // Нет timestamps, т.к. у чата только createdAt
  }
);

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
