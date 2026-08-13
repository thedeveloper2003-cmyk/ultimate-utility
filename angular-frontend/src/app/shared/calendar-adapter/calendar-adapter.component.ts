import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-calendar-adapter',
  template: `
    <p-calendar [(ngModel)]="value" [showIcon]="true"></p-calendar>
  `
})
export class CalendarAdapterComponent {
  @Input() value: Date | null = null;
}
