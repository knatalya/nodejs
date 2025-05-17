// src/search/search.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [HttpModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}