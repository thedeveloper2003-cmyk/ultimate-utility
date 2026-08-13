import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-adapter',
  template: `
    <p-table [value]="rows">
      <ng-container *ngIf="columns?.length; else autoCols">
        <ng-container *ngFor="let col of columns">
          <ng-template pTemplate="header">
            <th>{{ col.header }}</th>
          </ng-template>
        </ng-container>
      </ng-container>
      <ng-template #autoCols>
        <ng-template pTemplate="header">
          <tr>
            <th *ngFor="let key of autoKeys">{{ key }}</th>
          </tr>
        </ng-template>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr>
          <td *ngFor="let key of autoKeys">{{ row[key] }}</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class TableAdapterComponent {
  @Input() rows: any[] = [];
  @Input() columns: { field: string; header: string }[] | null = null;

  get autoKeys(): string[] {
    if (this.rows && this.rows.length) return Object.keys(this.rows[0]);
    return [];
  }
}
