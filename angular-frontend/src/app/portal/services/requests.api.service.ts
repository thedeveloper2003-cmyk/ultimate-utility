  create(payload: any) {
    if (!environment.apiUrl) {
      const newReq = { ...payload, id: `req-${Date.now()}` };
      this.requests$.next([...(this.requests$.value || []), newReq]);
      return of(newReq);
    }
    return this.http.post<any>(`${environment.apiUrl}/requests`, payload);
  }

  update(id: string, payload: any) {
    if (!environment.apiUrl) {
      const updated = { ...payload, id };
      this.requests$.next((this.requests$.value || []).map(r => r.id === id ? updated : r));
      return of(updated);
    }
    return this.http.put<any>(`${environment.apiUrl}/requests/${id}`, payload);
  }

  delete(id: string) {
    if (!environment.apiUrl) {
      this.requests$.next((this.requests$.value || []).filter(r => r.id !== id));
      return of({ success: true });
    }
    return this.http.delete<any>(`${environment.apiUrl}/requests/${id}`);
  }
