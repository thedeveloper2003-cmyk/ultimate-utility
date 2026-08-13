import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeetingsApiService } from '../services/meetings.api.service';

@Component({
  selector: 'app-portal-meeting',
  template: `
    <div class="p-4 max-w-2xl">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">Meeting</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-3">
        <div>
          <label class="block text-sm font-medium">Title</label>
          <input formControlName="title" class="mt-1 block w-full rounded border px-2 py-1" />
        </div>

        <div>
          <label class="block text-sm font-medium">Date</label>
          <input formControlName="date" type="date" class="mt-1 block w-full rounded border px-2 py-1" />
        </div>

        <div>
          <label class="block text-sm font-medium">Start time</label>
          <input formControlName="startTime" type="time" class="mt-1 block w-full rounded border px-2 py-1" />
        </div>

        <div class="flex gap-2">
          <button class="px-3 py-1 bg-blue-600 text-white rounded" type="submit" [disabled]="form.invalid">Save</button>
          <button class="px-3 py-1 bg-gray-200 rounded" type="button" (click)="cancel()">Cancel</button>
          <button *ngIf="meetingId" class="px-3 py-1 bg-red-500 text-white rounded ml-auto" type="button" (click)="remove()">Delete</button>
        </div>
      </form>
    </div>
  `
})
export class PortalMeetingComponent implements OnInit {
  form: FormGroup;
  meetingId: string | null = null;

  constructor(private route: ActivatedRoute, private api: MeetingsApiService, private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({ title: ['', Validators.required], date: [''], startTime: [''] });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('meetingId');
    if (id && id !== 'new') {
      this.meetingId = id;
      this.api.getById(id).subscribe((m) => {
        if (m) this.form.patchValue({ title: m.title, date: m.date || '', startTime: m.startTime || '' });
      });
    }
  }

  save() {
    const payload = this.form.value;
    // stubs: MeetingsApiService currently provides get/list only; in a full API we'd call create/update
    // For now, navigate back after pretend save
    this.router.navigate(['/portal/meetings']);
  }

  cancel() { this.router.navigate(['/portal/meetings']); }

  remove() {
    // no delete implemented on stub; navigate back
    this.router.navigate(['/portal/meetings']);
  }
}
