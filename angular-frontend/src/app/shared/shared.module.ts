import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';

import { ButtonComponent } from './button/button.component';
import { TableAdapterComponent } from './table-adapter/table-adapter.component';
import { CalendarAdapterComponent } from './calendar-adapter/calendar-adapter.component';
import { ProgressComponent } from './progress/progress.component';

@NgModule({
  declarations: [ButtonComponent, TableAdapterComponent, CalendarAdapterComponent, ProgressComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, TableModule, CalendarModule],
  exports: [ButtonComponent, TableAdapterComponent, CalendarAdapterComponent, ProgressComponent, ButtonModule, TableModule, CalendarModule, CommonModule, ReactiveFormsModule]
})
export class SharedModule {}
