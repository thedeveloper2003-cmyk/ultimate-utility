import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectsApiService } from '../services/projects.api.service';

@Component({
  selector: 'app-portal-project',
  template: `
    <div class="p-4 max-w-2xl">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">Project</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-3">
        <div>
          <label class="block text-sm font-medium">Title</label>
          <input formControlName="title" class="mt-1 block w-full rounded border px-2 py-1" />
        </div>

        <div>
          <label class="block text-sm font-medium">Status</label>
          <select formControlName="status" class="mt-1 block w-full rounded border px-2 py-1">
            <option>Active</option>
            <option>Paused</option>
            <option>Completed</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button class="px-3 py-1 bg-blue-600 text-white rounded" type="submit" [disabled]="form.invalid">Save</button>
          <button class="px-3 py-1 bg-gray-200 rounded" type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `
})
export class PortalProjectComponent implements OnInit {
  form: FormGroup;
  projectId: string | null = null;

  constructor(private route: ActivatedRoute, private api: ProjectsApiService, private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({ title: ['', Validators.required], status: ['Active', Validators.required] });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('projectId');
    if (id && id !== 'new') {
      this.projectId = id;
      this.api.getById(id).subscribe((p) => {
        if (p) this.form.patchValue({ title: p.title, status: p.status || 'Active' });
      });
    }
  }

  save() {
    // stub: pretend save and navigate back
    this.router.navigate(['/portal/projects']);
  }

  cancel() { this.router.navigate(['/portal/projects']); }
}
