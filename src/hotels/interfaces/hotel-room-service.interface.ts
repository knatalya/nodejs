// file: src/hotels/interfaces/hotel-room-service.interface.ts
import { HotelRoom } from '../schemas/hotel-room.schema';
type ID = string;

export interface SearchRoomsParams {
  limit: number;
  offset: number;
  hotel: ID;
  isEnabled?: boolean;
}

export interface IHotelRoomService {
  create(data: Partial<HotelRoom>): Promise<HotelRoom>;
  findById(id: ID): Promise<HotelRoom>;
  search(params: SearchRoomsParams): Promise<HotelRoom[]>;
  update(id: ID, data: Partial<HotelRoom>): Promise<HotelRoom>;
}
