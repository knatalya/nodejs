// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    contactPhone: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true // добавит createdAt и updatedAt (не критично, но удобно)
  }
);

// В качестве модели экспортируем User
const User = mongoose.model('User', userSchema);
module.exports = User;
