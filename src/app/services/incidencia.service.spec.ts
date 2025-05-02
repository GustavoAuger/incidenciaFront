import { TestBed } from '@angular/core/testing';

import { IncidenciaService } from './incidencia.service';

describe('IncidenciaService', () => {
  let service: IncidenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncidenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
