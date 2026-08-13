import { Component } from '@angular/core';

@Component({
  selector: 'app-portal-tasks-index',
  template: `
    <div>
      <h3 class="text-2xl font-bold mb-4">Tasks</h3>
      <ul class="space-y-2">
        <li *ngFor="let t of tasks" class="p-2 bg-white border rounded">{{ t.title }}</li>
      </ul>
    </div>
  `
})
export class PortalTasksIndexComponent {
  tasks = [
    { id: 1, title: 'Task A' },
    { id: 2, title: 'Task B' },
    { id: 3, title: 'Task C' }
  ];
}
