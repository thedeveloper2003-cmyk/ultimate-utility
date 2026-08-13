import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestsApiService } from '../services/requests.api.service';

@Component({
  selector: 'app-portal-request',
  template: `
    <div class="p-4 max-w-2xl">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">Request</h2>
      </div>

      <div *ngIf="req">
        <p class="font-medium">{{ req.title }}</p>
        <p class="text-xs text-muted-foreground">Status: {{ req.status }}</p>
      </div>

      <div class="mt-4 flex gap-2">
        <button *ngIf="req?.status === 'Pending'" class="px-3 py-1 bg-green-600 text-white rounded" (click)="approve()">Approve</button>
        <button *ngIf="req?.status === 'Pending'" class="px-3 py-1 bg-red-600 text-white rounded" (click)="reject()">Reject</button>
        <button class="px-3 py-1 bg-gray-200 rounded ml-auto" (click)="back()">Back</button>
      </div>
    </div>
  `
})
export class PortalRequestComponent implements OnInit {
  req: any = null;
  requestId: string | null = null;
  constructor(private route: ActivatedRoute, private api: RequestsApiService, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('requestId');
    if (id && id !== 'new') {
      this.requestId = id;
      this.api.getById(id).subscribe((r) => (this.req = r));
    }
  }

  approve() {
    if (!this.requestId) return;
    this.api.approve(this.requestId).subscribe(() => this.router.navigate(['/portal/requests']));
  }

  reject() {
    if (!this.requestId) return;
    this.api.reject(this.requestId).subscribe(() => this.router.navigate(['/portal/requests']));
  }

  back() { this.router.navigate(['/portal/requests']); }
}
