import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private projects$ = new BehaviorSubject<any[] | null>(null);
  constructor(private http: HttpClient) {}

  loadAll(): Observable<any[] | null> {
    if (!environment.apiUrl) {
      if (!this.projects$.value) {
        setTimeout(() => this.projects$.next([
          { projectId: 'proj-1', title: 'New Website', memberIds: ['1'], leadId: '1', status: 'Active' },
          { projectId: 'proj-2', title: 'Mobile App', memberIds: ['2'], leadId: '2', status: 'Active' }
        ]), 150);
      }
      return this.projects$.asObservable();
    }
    return this.http.get<any[]>(`${environment.apiUrl}/projects`);
  }

  getById(id: string): Observable<any> {
    if (!environment.apiUrl) {
      const found = (this.projects$.value || []).find(p => p.projectId === id);
      return of(found || null);
    }
    return this.http.get<any>(`${environment.apiUrl}/projects/${id}`);
  }
}
