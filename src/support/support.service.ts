// file: src/support/support.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportRequest } from './schemas/support-request.schema';
import { Message } from './schemas/message.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportRequest.name) private reqModel: Model<SupportRequest>,
    @InjectModel(Message.name) private msgModel: Model<Message>,
    private emitter: EventEmitter2,
  ) {}

  async findSupportRequests(user: string | null, isActive: boolean) {
    const filter: any = { isActive };
    if (user) filter.user = user;
    return this.reqModel.find(filter).exec();
  }

  async sendMessage(author: string, supportRequestId: string, text: string) {
    const msg = new this.msgModel({ author, sentAt: new Date(), text });
    await msg.save();
    const req = await this.reqModel.findById(supportRequestId);
    req.messages.push(msg);
    await req.save();
    this.emitter.emit('support.newMessage', req, msg);
    return msg;
  }

  async getMessages(supportRequestId: string) {
    const req = await this.reqModel.findById(supportRequestId).populate('messages').exec();
    return req.messages;
  }

  async markMessagesAsRead(user: string, supportRequestId: string, createdBefore: Date) {
    await this.msgModel.updateMany(
      { _id: { $in: (await this.reqModel.findById(supportRequestId)).messages }, author: { $ne: user }, sentAt: { $lte: createdBefore } },
      { $set: { readAt: new Date() } },
    ).exec();
  }

  async closeRequest(supportRequestId: string) {
    await this.reqModel.findByIdAndUpdate(supportRequestId, { isActive: false }).exec();
  }

  subscribe(handler: (req: SupportRequest, msg: Message) => void) {
    const listener = (req: SupportRequest, msg: Message) => handler(req, msg);
    this.emitter.on('support.newMessage', listener);
    return () => this.emitter.off('support.newMessage', listener);
  }
}
