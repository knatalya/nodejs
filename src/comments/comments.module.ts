// src/comments/comments.module.ts
import { Module } from '@nestjs/common';
import { BookCommentsService } from './book-comments.service';
import { BookCommentsGateway } from './book-comments.gateway';

@Module({
  providers: [BookCommentsService, BookCommentsGateway],
  exports: [BookCommentsService],
})
export class CommentsModule {}
