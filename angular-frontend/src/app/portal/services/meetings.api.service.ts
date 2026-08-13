  create(payload: any) {
    if (!environment.apiUrl) {
      const newMeeting = { ...payload, meetingId: `m${Date.now()}` };
      this.meetings$.next([...(this.meetings$.value || []), newMeeting]);
      return of(newMeeting);
    }
    return this.http.post<any>(`${environment.apiUrl}/meetings`, payload);
  }

  update(id: string, payload: any) {
    if (!environment.apiUrl) {
      const updated = { ...payload, meetingId: id };
      this.meetings$.next((this.meetings$.value || []).map(m => m.meetingId === id ? updated : m));
      return of(updated);
    }
    return this.http.put<any>(`${environment.apiUrl}/meetings/${id}`, payload);
  }

  delete(id: string) {
    if (!environment.apiUrl) {
      this.meetings$.next((this.meetings$.value || []).filter(m => m.meetingId !== id));
      return of({ success: true });
    }
    return this.http.delete<any>(`${environment.apiUrl}/meetings/${id}`);
  }
