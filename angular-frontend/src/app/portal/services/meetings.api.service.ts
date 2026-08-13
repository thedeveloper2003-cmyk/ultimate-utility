import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MeetingsApiService {
  private meetings$ = new BehaviorSubject<any[] | null>(null);
  constructor(private http: HttpClient) {}

  loadAll(): Observable<any[] | null> {
    if (!environment.apiUrl) {
      if (!this.meetings$.value) {
        setTimeout(() => this.meetings$.next([
          { meetingId: 'm1', title: 'All Hands', date: new Date().toISOString().slice(0,10), startTime: '09:00', organizerId: '1', participantIds: ['1'] },
          { meetingId: 'm2', title: 'Project Sync', date: new Date().toISOString().slice(0,10), startTime: '11:00', organizerId: '2', participantIds: ['1','2'] }
        ]), 150);
      }
      return this.meetings$.asObservable();
    }
    return this.http.get<any[]>(`${environment.apiUrl}/meetings`);
  }

  getById(id: string): Observable<any> {
    if (!environment.apiUrl) {
      const found = (this.meetings$.value || []).find(m => m.meetingId === id);
      return of(found || null);
    }
    return this.http.get<any>(`${environment.apiUrl}/meetings/${id}`);
  }
}
