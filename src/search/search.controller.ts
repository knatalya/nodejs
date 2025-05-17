// src/search/search.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // GET /search/github?query=nestjs
  @Get('github')
  searchGitHub(@Query('query') query: string): Observable<any> {
    return this.searchService.searchGitHub(query);
  }

  // GET /search/gitlab?query=nestjs
  @Get('gitlab')
  searchGitLab(@Query('query') query: string): Observable<any> {
    return this.searchService.searchGitLab(query);
  }
}
