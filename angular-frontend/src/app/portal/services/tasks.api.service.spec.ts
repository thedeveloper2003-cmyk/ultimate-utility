import { TestBed } from '@angular/core/testing';
import { TasksApiService } from './tasks.api.service';

describe('TasksApiService (stub)', () => {
  let service: TasksApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TasksApiService] });
    service = TestBed.inject(TasksApiService);
  });

  it('loads stub tasks and can create/update/delete', (done) => {
    service.loadAll().subscribe((tasks) => {
      if (!tasks) return; // wait for stub to populate
      expect(tasks.length).toBeGreaterThan(0);
      service.create({ title: 'X' }).subscribe((created) => {
        expect(created).toBeTruthy();
        const id = created.taskId;
        service.update(id, { title: 'Y' }).subscribe((updated) => {
          expect(updated.title).toBe('Y');
          service.delete(id).subscribe((res) => {
            expect(res).toBeTruthy();
            done();
          });
        });
      });
    });
  });
});
