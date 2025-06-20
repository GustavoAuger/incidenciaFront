import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamoTransportistaComponent } from './reclamo-transportista.component';

describe('ReclamoTransportistaComponent', () => {
  let component: ReclamoTransportistaComponent;
  let fixture: ComponentFixture<ReclamoTransportistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamoTransportistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamoTransportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
