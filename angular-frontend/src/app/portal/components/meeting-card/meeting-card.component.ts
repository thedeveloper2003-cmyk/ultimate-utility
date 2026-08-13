import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-meeting-card',
  template: `
    <div class="p-3 rounded-md border bg-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">{{ meeting.title }}</p>
          <p class="text-xs text-muted-foreground">{{ meeting.location }}</p>
        </div>
        <div class="text-sm text-muted-foreground">{{ meeting.startTime }}</div>
      </div>
    </div>
  `
})
export class MeetingCardComponent {
  @Input() meeting: any = {};
}
