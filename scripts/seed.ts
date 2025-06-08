// file: scripts/seed.ts
import { config } from 'dotenv';
import { getModelToken } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  config(); // load .env
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const userModel = appContext.get(getModelToken(User.name));

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password';

  const existing = await userModel.findOne({ email: adminEmail });
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await userModel.create({
      email: adminEmail,
      passwordHash: hash,
      name: 'Admin',
      role: 'admin',
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  await appContext.close();
  process.exit(0);
}

bootstrap();
