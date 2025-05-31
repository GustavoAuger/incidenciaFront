import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenciasSinResolverComponent } from './incidencias-sin-resolver.component';

describe('IncidenciasSinResolverComponent', () => {
  let component: IncidenciasSinResolverComponent;
  let fixture: ComponentFixture<IncidenciasSinResolverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenciasSinResolverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenciasSinResolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
