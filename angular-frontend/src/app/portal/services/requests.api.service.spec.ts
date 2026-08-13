import { TestBed } from '@angular/core/testing';
import { RequestsApiService } from './requests.api.service';

describe('RequestsApiService (stub)', () => {
  let service: RequestsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RequestsApiService] });
    service = TestBed.inject(RequestsApiService);
  });

  it('loads stub requests and can approve/reject/create/delete', (done) => {
    service.loadAll().subscribe((r) => {
      if (!r) return;
      expect(r.length).toBeGreaterThan(0);
      service.create({ title: 'RQ' }).subscribe((c) => {
        expect(c.id).toBeTruthy();
        service.approve(c.id).subscribe((res) => {
          expect(res).toBeTruthy();
          service.reject(c.id).subscribe((res2) => {
            expect(res2).toBeTruthy();
            service.delete(c.id).subscribe((del) => {
              expect(del).toBeTruthy();
              done();
            });
          });
        });
      });
    });
  });
});
