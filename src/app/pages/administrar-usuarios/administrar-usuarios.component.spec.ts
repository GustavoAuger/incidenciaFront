import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarUsuariosComponent } from './administrar-usuarios.component';

describe('AdministrarUsuariosComponent', () => {
  let component: AdministrarUsuariosComponent;
  let fixture: ComponentFixture<AdministrarUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrarUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrarUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
