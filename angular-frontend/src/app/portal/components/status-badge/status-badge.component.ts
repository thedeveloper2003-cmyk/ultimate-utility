import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full" [ngClass]="badgeClass">{{ value }}</span>
  `
})
export class StatusBadgeComponent {
  @Input() value = '';

  get badgeClass() {
    switch ((this.value || '').toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
