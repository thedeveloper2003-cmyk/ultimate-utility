import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentsApiService {
  private docs$ = new BehaviorSubject<any[] | null>(null);
  constructor(private http: HttpClient) {}

  loadAll(): Observable<any[] | null> {
    if (!environment.apiUrl) {
      if (!this.docs$.value) {
        setTimeout(() => this.docs$.next([
          { id: 'doc-1', title: 'Project Plan', updatedAt: new Date().toISOString() },
          { id: 'doc-2', title: 'Roadmap', updatedAt: new Date().toISOString() }
        ]), 150);
      }
      return this.docs$.asObservable();
    }
    return this.http.get<any[]>(`${environment.apiUrl}/documents`);
  }

  getById(id: string): Observable<any> {
    if (!environment.apiUrl) {
      const found = (this.docs$.value || []).find(d => d.id === id);
      return of(found || null);
    }
    return this.http.get<any>(`${environment.apiUrl}/documents/${id}`);
  }
}
