import { Observable } from 'rxjs';
import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    searchGitHub(query: string): Observable<any>;
    searchGitLab(query: string): Observable<any>;
}
