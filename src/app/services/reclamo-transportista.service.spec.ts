import { TestBed } from '@angular/core/testing';

import { ReclamoTransportistaService } from './reclamo-transportista.service';

describe('ReclamoTransportistaService', () => {
  let service: ReclamoTransportistaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReclamoTransportistaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
