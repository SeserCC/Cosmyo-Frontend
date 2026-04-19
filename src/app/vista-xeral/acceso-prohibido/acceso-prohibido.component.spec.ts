import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesoProhibidoComponent } from './acceso-prohibido.component';

describe('AccesoProhibidoComponent', () => {
  let component: AccesoProhibidoComponent;
  let fixture: ComponentFixture<AccesoProhibidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesoProhibidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesoProhibidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
