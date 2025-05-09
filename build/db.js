"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/db.ts
const mongoose_1 = __importDefault(require("mongoose"));
const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/library';
mongoose_1.default
    .connect(uri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});
exports.default = mongoose_1.default;
