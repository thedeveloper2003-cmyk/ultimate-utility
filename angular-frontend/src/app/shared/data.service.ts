import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private tasks$ = new BehaviorSubject<any[]>([]);
  constructor(private http: HttpClient) {}
  // Example: fetch tasks and cache
  loadTasks(): Observable<any[]> {
    // Placeholder: replace with real API
    setTimeout(() => this.tasks$.next([{ id: 1, title: 'Task A from API' }]), 200);
    return this.tasks$.asObservable();
  }
}
