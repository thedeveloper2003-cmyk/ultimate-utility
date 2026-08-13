  create(payload: any) {
    if (!environment.apiUrl) {
      const newProj = { ...payload, projectId: `proj-${Date.now()}` };
      this.projects$.next([...(this.projects$.value || []), newProj]);
      return of(newProj);
    }
    return this.http.post<any>(`${environment.apiUrl}/projects`, payload);
  }

  update(id: string, payload: any) {
    if (!environment.apiUrl) {
      const updated = { ...payload, projectId: id };
      this.projects$.next((this.projects$.value || []).map(p => p.projectId === id ? updated : p));
      return of(updated);
    }
    return this.http.put<any>(`${environment.apiUrl}/projects/${id}`, payload);
  }

  delete(id: string) {
    if (!environment.apiUrl) {
      this.projects$.next((this.projects$.value || []).filter(p => p.projectId !== id));
      return of({ success: true });
    }
    return this.http.delete<any>(`${environment.apiUrl}/projects/${id}`);
  }
