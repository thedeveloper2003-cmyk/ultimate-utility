import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MeetingsService {
  private meetings$ = new BehaviorSubject<any[] | null>(null);
  constructor(private http: HttpClient) {}
  loadAll(): Observable<any[] | null> {
    if (!this.meetings$.value) {
      setTimeout(() => this.meetings$.next([
        { id: 'm1', title: 'All Hands' },
        { id: 'm2', title: 'Project Sync' }
      ]), 200);
    }
    return this.meetings$.asObservable();
  }
}
