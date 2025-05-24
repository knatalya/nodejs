import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { BookCommentsService } from './book-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BookCommentModel } from './interfaces/book-comment.model';

@WebSocketGateway({ namespace: '/comments' })
export class BookCommentsGateway {
  constructor(private readonly commentsService: BookCommentsService) {}

  // Запрос всех комментариев для книги
  @SubscribeMessage('getAllComments')
  getAll(@MessageBody() data: { bookId: number }): BookCommentModel[] {
    return this.commentsService.findAllBookComments(data.bookId);
  }

  // Добавление нового комментария
  @SubscribeMessage('addComment')
  add(@MessageBody() dto: CreateCommentDto): BookCommentModel {
    return this.commentsService.create(dto);
  }
}
