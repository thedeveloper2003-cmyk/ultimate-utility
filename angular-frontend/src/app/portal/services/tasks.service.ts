import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private tasks$ = new BehaviorSubject<any[] | null>(null);
  constructor(private http: HttpClient) {}
  loadAll(): Observable<any[] | null> {
    if (!this.tasks$.value) {
      // Simulated fetch - replace with http.get in real migration
      setTimeout(() => this.tasks$.next([
        { id: 1, title: 'Task A from API' },
        { id: 2, title: 'Task B from API' }
      ]), 200);
    }
    return this.tasks$.asObservable();
  }
  getById(id: number) {
    return this.loadAll();
  }
}
