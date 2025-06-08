// file: src/reservations/interfaces/reservation-service.interface.ts
import { Reservation } from '../schemas/reservation.schema';

type ID = string;

export interface IReservationService {
  addReservation(data: {
    userId: ID;
    hotelId: ID;
    roomId: ID;
    dateStart: Date;
    dateEnd: Date;
  }): Promise<Reservation>;
  removeReservation(id: ID): Promise<void>;
  getReservations(filter: {
    userId: ID;
    dateStart: Date;
    dateEnd: Date;
  }): Promise<Reservation[]>;
}
