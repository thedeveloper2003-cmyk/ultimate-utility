import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="mb-6">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold">{{ title }}</h1>
          <p class="text-sm text-muted-foreground">{{ description }}</p>
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[header-actions]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
}
