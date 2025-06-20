import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolverIncidenciasComponent } from './resolver-incidencias.component';

describe('ResolverIncidenciasComponent', () => {
  let component: ResolverIncidenciasComponent;
  let fixture: ComponentFixture<ResolverIncidenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolverIncidenciasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolverIncidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
