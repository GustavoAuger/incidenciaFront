import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDetalleIncidenciaComponent } from './crear-detalle-incidencia.component';

describe('CrearDetalleIncidenciaComponent', () => {
  let component: CrearDetalleIncidenciaComponent;
  let fixture: ComponentFixture<CrearDetalleIncidenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearDetalleIncidenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearDetalleIncidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
