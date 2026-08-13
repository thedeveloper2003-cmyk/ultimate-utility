import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress',
  template: `
    <div class="w-full h-2 bg-gray-200 rounded overflow-hidden">
      <div class="bg-blue-600 h-full" [style.width.%]="value"></div>
    </div>
  `
})
export class ProgressComponent { @Input() value = 0; }
