import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionReceiptModalComponent } from './production-receipt-modal.component';

describe('ProductionReceiptModalComponent', () => {
  let component: ProductionReceiptModalComponent;
  let fixture: ComponentFixture<ProductionReceiptModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionReceiptModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionReceiptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
