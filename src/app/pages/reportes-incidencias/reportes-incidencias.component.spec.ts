import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesIncidenciasComponent } from './reportes-incidencias.component';

describe('ReportesIncidenciasComponent', () => {
  let component: ReportesIncidenciasComponent;
  let fixture: ComponentFixture<ReportesIncidenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesIncidenciasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesIncidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
