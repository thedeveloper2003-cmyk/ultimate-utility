import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private docs$ = new BehaviorSubject<any[] | null>(null);
  constructor(private http: HttpClient) {}
  loadAll(): Observable<any[] | null> {
    if (!this.docs$.value) {
      setTimeout(() => this.docs$.next([
        { id: 'doc-1', title: 'Project Plan' },
        { id: 'doc-2', title: 'Roadmap' }
      ]), 200);
    }
    return this.docs$.asObservable();
  }
}
