import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-project-card',
  template: `
    <div class="p-3 rounded-md border bg-white">
      <p class="font-medium">{{ project.title }}</p>
      <p class="text-xs text-muted-foreground">Lead: {{ lead?.firstName }}</p>
    </div>
  `
})
export class ProjectCardComponent {
  @Input() project: any = {};
  @Input() lead: any = null;
}
