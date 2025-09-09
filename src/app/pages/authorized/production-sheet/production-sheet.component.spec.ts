import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionSheetComponent } from './production-sheet.component';

describe('ProductionSheetComponent', () => {
  let component: ProductionSheetComponent;
  let fixture: ComponentFixture<ProductionSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
