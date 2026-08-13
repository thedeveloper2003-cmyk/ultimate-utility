import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="p-6 text-center text-sm text-muted-foreground">
      <h4 class="font-medium mb-2">{{ title }}</h4>
      <p>{{ message }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() message = '';
}
