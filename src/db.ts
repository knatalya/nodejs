import mongoose from 'mongoose';

// URI подключения к MongoDB (можно через переменную окружения)
const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/library';

// Включаем строгую проверку схемы (опция mongoose >= 7)
mongoose.set('strictQuery', true);

// Подключаемся к базе
mongoose
  .connect(uri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export default mongoose;