// src/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SearchService {
  constructor(private readonly http: HttpService) {}

  // Задание 1: GitHub
  searchGitHub(query: string): Observable<any> {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`;
    return this.http.get(url).pipe(
      map(response => response.data),
    );
  }

  // Задание 2: GitLab
  searchGitLab(query: string): Observable<any> {
    const url = `https://gitlab.com/api/v4/projects?search=${encodeURIComponent(query)}`;
    return this.http.get(url).pipe(
      map(response => response.data),
    );
  }
}