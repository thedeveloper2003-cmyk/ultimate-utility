import { Component } from '@angular/core';

@Component({
  selector: 'app-portal-shell',
  template: `
    <div class="flex">
      <aside class="w-64 p-4 bg-white border-r"> 
        <h2 class="font-semibold mb-4">Portal</h2>
        <nav class="flex flex-col gap-2">
          <a routerLink="/portal/dashboard" class="text-sm text-blue-600">Dashboard</a>
          <a routerLink="/portal/calendar" class="text-sm text-blue-600">Calendar</a>
          <a routerLink="/portal/tasks" class="text-sm text-blue-600">Tasks</a>
        </nav>
      </aside>
      <main class="flex-1 p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class PortalShellComponent {}
