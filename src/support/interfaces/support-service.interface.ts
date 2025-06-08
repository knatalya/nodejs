// file: src/support/interfaces/support-service.interface.ts
import { SupportRequest } from '../schemas/support-request.schema';
import { Message } from '../schemas/message.schema';

type ID = string;

export interface ISupportRequestService {
  findSupportRequests(user: ID | null, isActive: boolean): Promise<SupportRequest[]>;
  sendMessage(author: ID, supportRequest: ID, text: string): Promise<Message>;
  getMessages(supportRequest: ID): Promise<Message[]>;
  markMessagesAsRead(user: ID, supportRequest: ID, createdBefore: Date): Promise<void>;
  closeRequest(supportRequest: ID): Promise<void>;
  subscribe(handler: (req: SupportRequest, msg: Message) => void): () => void;
}