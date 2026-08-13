import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button class="px-3 py-1 bg-blue-600 text-white rounded" [type]="type"><ng-content></ng-content></button>`
})
export class ButtonComponent { @Input() type = 'button'; }
