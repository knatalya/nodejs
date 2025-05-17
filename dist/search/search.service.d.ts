import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
export declare class SearchService {
    private readonly http;
    constructor(http: HttpService);
    searchGitHub(query: string): Observable<any>;
    searchGitLab(query: string): Observable<any>;
}
