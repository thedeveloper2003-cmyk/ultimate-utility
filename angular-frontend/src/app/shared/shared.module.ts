import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { SidebarModule } from 'primeng/sidebar';
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng/tooltip';

import { ButtonComponent } from './button/button.component';
import { TableAdapterComponent } from './table-adapter/table-adapter.component';
import { CalendarAdapterComponent } from './calendar-adapter/calendar-adapter.component';

@NgModule({
  declarations: [ButtonComponent, TableAdapterComponent, CalendarAdapterComponent],
  imports: [CommonModule, HttpClientModule, ButtonModule, TableModule, CalendarModule, SidebarModule, MenubarModule, TooltipModule],
  exports: [ButtonComponent, TableAdapterComponent, CalendarAdapterComponent, ButtonModule, TableModule, CalendarModule, SidebarModule, MenubarModule, TooltipModule, CommonModule]
})
export class SharedModule {}
