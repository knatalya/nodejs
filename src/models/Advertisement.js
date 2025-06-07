// src/models/Advertisement.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const advertisementSchema = new Schema(
  {
    shortText: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    images: {
      type: [String], // пути к файлам, например "/uploads/..."
      default: []
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    tags: {
      type: [String],
      default: []
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    // timestamps: true // не используем, т.к. сами задаём createdAt/updatedAt
  }
);

// Перед сохранением обновляем updatedAt
advertisementSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);
module.exports = Advertisement;
