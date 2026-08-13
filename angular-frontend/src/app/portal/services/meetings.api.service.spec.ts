import { TestBed } from '@angular/core/testing';
import { MeetingsApiService } from './meetings.api.service';

describe('MeetingsApiService (stub)', () => {
  let service: MeetingsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MeetingsApiService] });
    service = TestBed.inject(MeetingsApiService);
  });

  it('loads stub meetings and can create/update/delete', (done) => {
    service.loadAll().subscribe((m) => {
      if (!m) return;
      expect(m.length).toBeGreaterThan(0);
      service.create({ title: 'New' }).subscribe((created) => {
        expect(created.meetingId).toBeTruthy();
        service.update(created.meetingId, { title: 'New2' }).subscribe((updated) => {
          expect(updated.title).toBe('New2');
          service.delete(created.meetingId).subscribe((res) => {
            expect(res).toBeTruthy();
            done();
          });
        });
      });
    });
  });
});
