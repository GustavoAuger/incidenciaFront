import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenciasConReclamoComponent } from './incidencias-con-reclamo.component';

describe('IncidenciasConReclamoComponent', () => {
  let component: IncidenciasConReclamoComponent;
  let fixture: ComponentFixture<IncidenciasConReclamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenciasConReclamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenciasConReclamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
