import { TestBed } from '@angular/core/testing';
import { DocumentsApiService } from './documents.api.service';

describe('DocumentsApiService (stub)', () => {
  let service: DocumentsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DocumentsApiService] });
    service = TestBed.inject(DocumentsApiService);
  });

  it('loads stub docs and can create/update/delete', (done) => {
    service.loadAll().subscribe((d) => {
      if (!d) return;
      expect(d.length).toBeGreaterThan(0);
      service.create({ title: 'Doc' }).subscribe((c) => {
        expect(c.id).toBeTruthy();
        service.update(c.id, { title: 'Doc2' }).subscribe((u) => {
          expect(u.title).toBe('Doc2');
          service.delete(c.id).subscribe((res) => {
            expect(res).toBeTruthy();
            done();
          });
        });
      });
    });
  });
});
