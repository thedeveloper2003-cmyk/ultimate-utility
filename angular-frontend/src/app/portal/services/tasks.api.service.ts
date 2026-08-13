  delete(id: number): Observable<any> {
    if (!environment.apiUrl) {
      this.tasks$.next((this.tasks$.value || []).filter((t: any) => t.taskId !== id));
      return of({ success: true });
    }
    return this.http.delete<any>(`${environment.apiUrl}/tasks/${id}`);
  }
