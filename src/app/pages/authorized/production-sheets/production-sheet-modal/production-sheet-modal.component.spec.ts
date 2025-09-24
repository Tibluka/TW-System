import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionSheetModalComponent } from './production-sheet-modal.component';

describe('ProductionSheetModalComponent', () => {
  let component: ProductionSheetModalComponent;
  let fixture: ComponentFixture<ProductionSheetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionSheetModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionSheetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
