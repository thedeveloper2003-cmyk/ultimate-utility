import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timeline-view',
  template: `
    <ul class="space-y-2">
      <li *ngFor="let b of blocks" class="p-2 rounded-md border bg-white">{{ b.title }} <span class="text-xs text-muted-foreground">{{ b.time }}</span></li>
    </ul>
  `
})
export class TimelineViewComponent {
  @Input() blocks: any[] = [];
}
