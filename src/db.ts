// src/db.ts
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/library';

mongoose
  .connect(uri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export default mongoose;
