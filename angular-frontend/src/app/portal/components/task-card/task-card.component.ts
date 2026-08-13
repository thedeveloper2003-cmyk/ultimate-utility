import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-task-card',
  template: `
    <div class="p-3 rounded-md border bg-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">{{ task.title }}</p>
          <p class="text-xs text-muted-foreground">{{ project?.title }}</p>
        </div>
        <div class="text-sm text-muted-foreground">{{ task.priority }}</div>
      </div>
    </div>
  `
})
export class TaskCardComponent {
  @Input() task: any = {};
  @Input() project: any = null;
}
