import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  template: `
    <div [ngClass]="['surface-card', className]">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h4 class="font-semibold">{{ title }}</h4>
          <p class="text-xs text-muted-foreground">{{ subtitle }}</p>
        </div>
        <div>
          <ng-content select="[card-action]"></ng-content>
        </div>
      </div>
      <div>
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class SectionCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() className = '';
}
