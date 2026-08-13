  save() {
    const payload: any = { title: this.doc?.title || 'New document', updatedAt: new Date().toISOString() };
    const id = this.route.snapshot.paramMap.get('documentId');
    if (id && id !== 'new') {
      this.api.update(id, payload).subscribe(() => this.router.navigate(['/portal/documents']));
    } else {
      this.api.create(payload).subscribe(() => this.router.navigate(['/portal/documents']));
    }
  }
