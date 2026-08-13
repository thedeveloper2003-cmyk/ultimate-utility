import { TestBed } from '@angular/core/testing';
import { ProjectsApiService } from './projects.api.service';

describe('ProjectsApiService (stub)', () => {
  let service: ProjectsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProjectsApiService] });
    service = TestBed.inject(ProjectsApiService);
  });

  it('loads stub projects and can create/update/delete', (done) => {
    service.loadAll().subscribe((p) => {
      if (!p) return;
      expect(p.length).toBeGreaterThan(0);
      service.create({ title: 'P' }).subscribe((c) => {
        expect(c.projectId).toBeTruthy();
        service.update(c.projectId, { title: 'P2' }).subscribe((u) => {
          expect(u.title).toBe('P2');
          service.delete(c.projectId).subscribe((res) => {
            expect(res).toBeTruthy();
            done();
          });
        });
      });
    });
  });
});
