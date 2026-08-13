  save() {
    const payload = this.form.value;
    if (this.projectId) {
      this.api.update(this.projectId, payload).subscribe(() => this.router.navigate(['/portal/projects']));
    } else {
      this.api.create(payload).subscribe(() => this.router.navigate(['/portal/projects']));
    }
  }

  cancel() { this.router.navigate(['/portal/projects']); }
