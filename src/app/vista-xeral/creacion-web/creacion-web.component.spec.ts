import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreacionWebComponent } from './creacion-web.component';

describe('CreacionWebComponent', () => {
  let component: CreacionWebComponent;
  let fixture: ComponentFixture<CreacionWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreacionWebComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreacionWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
