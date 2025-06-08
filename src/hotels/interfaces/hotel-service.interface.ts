// file: src/hotels/interfaces/hotel-service.interface.ts
import { Hotel } from '../schemas/hotel.schema';
type ID = string;

export interface SearchHotelParams {
  limit: number;
  offset: number;
  title?: string;
}

export interface UpdateHotelParams {
  title: string;
  description?: string;
}

export interface IHotelService {
  create(data: Partial<Hotel>): Promise<Hotel>;
  findById(id: ID): Promise<Hotel>;
  search(params: SearchHotelParams): Promise<Hotel[]>;
  update(id: ID, data: UpdateHotelParams): Promise<Hotel>;
}