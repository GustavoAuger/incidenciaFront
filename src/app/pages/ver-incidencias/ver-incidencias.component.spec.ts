import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerIncidenciasComponent } from './ver-incidencias.component';

describe('VerIncidenciasComponent', () => {
  let component: VerIncidenciasComponent;
  let fixture: ComponentFixture<VerIncidenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerIncidenciasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerIncidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
