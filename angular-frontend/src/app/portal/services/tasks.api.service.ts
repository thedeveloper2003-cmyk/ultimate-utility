import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private tasks$ = new BehaviorSubject<any[] | null>(null);

  constructor(private http: HttpClient) {}

  loadAll(): Observable<any[] | null> {
    if (!environment.apiUrl) {
      // fallback simulated data
      if (!this.tasks$.value) {
        setTimeout(() => this.tasks$.next([
          { taskId: 1, title: 'Task A (stub)', employeeId: '1', status: 'Open', priority: 'High', dueDate: new Date().toISOString().slice(0,10), updatedAt: new Date().toISOString() },
          { taskId: 2, title: 'Task B (stub)', employeeId: '1', status: 'In Progress', priority: 'Medium', dueDate: new Date().toISOString().slice(0,10), updatedAt: new Date().toISOString() }
        ]), 150);
      }
      return this.tasks$.asObservable();
    }

    // Real API path: GET /tasks
    return this.http.get<any[]>(`${environment.apiUrl}/tasks`);
  }

  getById(id: number): Observable<any> {
    if (!environment.apiUrl) {
      const found = (this.tasks$.value || []).find((t: any) => t.taskId === id);
      return of(found || null);
    }
    return this.http.get<any>(`${environment.apiUrl}/tasks/${id}`);
  }

  create(payload: any): Observable<any> {
    if (!environment.apiUrl) {
      const newTask = { ...payload, taskId: Date.now(), updatedAt: new Date().toISOString() };
      this.tasks$.next([...(this.tasks$.value || []), newTask]);
      return of(newTask);
    }
    return this.http.post<any>(`${environment.apiUrl}/tasks`, payload);
  }

  update(id: number, payload: any): Observable<any> {
    if (!environment.apiUrl) {
      const updated = { ...payload, taskId: id, updatedAt: new Date().toISOString() };
      this.tasks$.next((this.tasks$.value || []).map((t: any) => (t.taskId === id ? updated : t)));
      return of(updated);
    }
    return this.http.put<any>(`${environment.apiUrl}/tasks/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    if (!environment.apiUrl) {
      this.tasks$.next((this.tasks$.value || []).filter((t: any) => t.taskId !== id));
      return of({ success: true });
    }
    return this.http.delete<any>(`${environment.apiUrl}/tasks/${id}`);
  }
}
