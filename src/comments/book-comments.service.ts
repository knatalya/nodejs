import { Injectable, NotFoundException } from '@nestjs/common';
import { BookCommentModel } from './interfaces/book-comment.model';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class BookCommentsService {
  private comments: BookCommentModel[] = [];
  private nextId = 1;

  create(dto: CreateCommentDto): BookCommentModel {
    const comment: BookCommentModel = {
      id: this.nextId++,
      bookId: dto.bookId,
      comment: dto.comment,
    };
    this.comments.push(comment);
    return comment;
  }

  findAll(): BookCommentModel[] {
    return [...this.comments];
  }

  findOne(id: number): BookCommentModel {
    const c = this.comments.find(x => x.id === id);
    if (!c) throw new NotFoundException(`Comment ${id} not found`);
    return c;
  }

  update(id: number, dto: CreateCommentDto): BookCommentModel {
    const idx = this.comments.findIndex(x => x.id === id);
    if (idx === -1) throw new NotFoundException(`Comment ${id} not found`);
    const updated: BookCommentModel = { id, bookId: dto.bookId, comment: dto.comment };
    this.comments[idx] = updated;
    return updated;
  }

  remove(id: number): void {
    const idx = this.comments.findIndex(x => x.id === id);
    if (idx === -1) throw new NotFoundException(`Comment ${id} not found`);
    this.comments.splice(idx, 1);
  }

  findAllBookComments(bookId: number): BookCommentModel[] {
    return this.comments.filter(x => x.bookId === bookId);
  }
}
