import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearIncidenciaComponent } from './crear-incidencia.component';

describe('CrearIncidenciaComponent', () => {
  let component: CrearIncidenciaComponent;
  let fixture: ComponentFixture<CrearIncidenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearIncidenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearIncidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
