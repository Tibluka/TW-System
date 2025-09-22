import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuesDataComponent } from './values-data.component';

describe('ValuesDataComponent', () => {
  let component: ValuesDataComponent;
  let fixture: ComponentFixture<ValuesDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValuesDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValuesDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
