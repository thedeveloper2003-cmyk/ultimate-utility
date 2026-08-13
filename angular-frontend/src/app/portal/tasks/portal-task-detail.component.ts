import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TasksApiService } from '../services/tasks.api.service';

@Component({
  selector: 'app-portal-task-detail',
  template: `
    <div class="p-4">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">Task</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-3 max-w-xl">
        <div>
          <label class="block text-sm font-medium">Title</label>
          <input formControlName="title" class="mt-1 block w-full rounded border px-2 py-1" />
        </div>

        <div>
          <label class="block text-sm font-medium">Priority</label>
          <select formControlName="priority" class="mt-1 block w-full rounded border px-2 py-1">
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button class="px-3 py-1 bg-blue-600 text-white rounded" type="submit" [disabled]="form.invalid">Save</button>
          <button class="px-3 py-1 bg-gray-200 rounded" type="button" (click)="cancel()">Cancel</button>
          <button *ngIf="taskId" class="px-3 py-1 bg-red-500 text-white rounded ml-auto" type="button" (click)="remove()">Delete</button>
        </div>
      </form>
    </div>
  `
})
export class PortalTaskDetailComponent implements OnInit {
  form: FormGroup;
  taskId: number | null = null;

  constructor(private route: ActivatedRoute, private api: TasksApiService, private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({ title: ['', Validators.required], priority: ['Medium', Validators.required] });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('taskId');
    if (id && id !== 'new') {
      this.taskId = Number(id);
      this.api.getById(this.taskId).subscribe((t) => {
        if (t) this.form.patchValue({ title: t.title, priority: t.priority || 'Medium' });
      });
    }
  }

  save() {
    const payload = this.form.value;
    if (this.taskId) {
      this.api.update(this.taskId, payload).subscribe(() => this.router.navigate(['/portal/tasks']));
    } else {
      this.api.create(payload).subscribe(() => this.router.navigate(['/portal/tasks']));
    }
  }

  cancel() { this.router.navigate(['/portal/tasks']); }

  remove() {
    if (!this.taskId) return;
    this.api.delete(this.taskId).subscribe(() => this.router.navigate(['/portal/tasks']));
  }
}
