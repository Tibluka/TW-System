import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionSheetsComponent } from './production-sheets.component';

describe('ProductionSheetsComponent', () => {
  let component: ProductionSheetsComponent;
  let fixture: ComponentFixture<ProductionSheetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionSheetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionSheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
