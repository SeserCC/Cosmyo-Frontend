import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TecnologiasEmpleadasComponent } from './tecnologias-empleadas.component';

describe('TecnologiasEmpleadasComponent', () => {
  let component: TecnologiasEmpleadasComponent;
  let fixture: ComponentFixture<TecnologiasEmpleadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TecnologiasEmpleadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TecnologiasEmpleadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
