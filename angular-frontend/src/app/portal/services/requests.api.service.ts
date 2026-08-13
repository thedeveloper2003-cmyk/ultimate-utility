import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RequestsApiService {
  private requests$ = new BehaviorSubject<any[] | null>(null);
  constructor(private http: HttpClient) {}

  loadAll(): Observable<any[] | null> {
    if (!environment.apiUrl) {
      if (!this.requests$.value) {
        setTimeout(() => this.requests$.next([
          { id: 'req-1', title: 'Time Off', status: 'Pending', requesterId: '1' },
          { id: 'req-2', title: 'Equipment', status: 'Resolved', requesterId: '2' }
        ]), 150);
      }
      return this.requests$.asObservable();
    }
    return this.http.get<any[]>(`${environment.apiUrl}/requests`);
  }

  getById(id: string): Observable<any> {
    if (!environment.apiUrl) {
      const found = (this.requests$.value || []).find(r => r.id === id);
      return of(found || null);
    }
    return this.http.get<any>(`${environment.apiUrl}/requests/${id}`);
  }

  approve(id: string): Observable<any> {
    if (!environment.apiUrl) {
      this.requests$.next((this.requests$.value || []).map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
      return of({ success: true });
    }
    return this.http.post<any>(`${environment.apiUrl}/requests/${id}/approve`, {});
  }

  reject(id: string): Observable<any> {
    if (!environment.apiUrl) {
      this.requests$.next((this.requests$.value || []).map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
      return of({ success: true });
    }
    return this.http.post<any>(`${environment.apiUrl}/requests/${id}/reject`, {});
  }
}
