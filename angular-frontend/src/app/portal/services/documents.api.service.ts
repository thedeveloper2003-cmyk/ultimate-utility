  create(payload: any) {
    if (!environment.apiUrl) {
      const newDoc = { ...payload, id: `doc-${Date.now()}`, updatedAt: new Date().toISOString() };
      this.docs$.next([...(this.docs$.value || []), newDoc]);
      return of(newDoc);
    }
    return this.http.post<any>(`${environment.apiUrl}/documents`, payload);
  }

  update(id: string, payload: any) {
    if (!environment.apiUrl) {
      const updated = { ...payload, id };
      this.docs$.next((this.docs$.value || []).map(d => d.id === id ? updated : d));
      return of(updated);
    }
    return this.http.put<any>(`${environment.apiUrl}/documents/${id}`, payload);
  }

  delete(id: string) {
    if (!environment.apiUrl) {
      this.docs$.next((this.docs$.value || []).filter(d => d.id !== id));
      return of({ success: true });
    }
    return this.http.delete<any>(`${environment.apiUrl}/documents/${id}`);
  }
