// src/users/interfaces/user-service.interface.ts

import { User } from '../schemas/user.schema';

export interface SearchUserParams {
  limit: number;
  offset: number;
  email?: string;
  name?: string;
  contactPhone?: string;
}

export interface IUserService {
  create(data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(params: SearchUserParams): Promise<User[]>;
}
