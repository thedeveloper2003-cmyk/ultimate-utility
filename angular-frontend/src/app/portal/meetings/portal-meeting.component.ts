  save() {
    const payload = this.form.value;
    if (this.meetingId) {
      this.api.update(this.meetingId, payload).subscribe(() => this.router.navigate(['/portal/meetings']));
    } else {
      this.api.create(payload).subscribe(() => this.router.navigate(['/portal/meetings']));
    }
  }

  cancel() { this.router.navigate(['/portal/meetings']); }

  remove() {
    if (!this.meetingId) return;
    this.api.delete(this.meetingId).subscribe(() => this.router.navigate(['/portal/meetings']));
  }
