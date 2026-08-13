import { Component } from '@angular/core';

@Component({
  selector: 'app-index',
  template: `
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-4">Ultimate Utility (Angular PoC)</h1>
    <a routerLink="/portal" class="text-blue-600 underline">Open Portal</a>
  </div>
  `
})
export class IndexComponent {}
