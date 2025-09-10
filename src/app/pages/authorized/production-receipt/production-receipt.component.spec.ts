import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionReceiptComponent } from './production-receipt.component';

describe('ProductionReceiptComponent', () => {
  let component: ProductionReceiptComponent;
  let fixture: ComponentFixture<ProductionReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionReceiptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProductionReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
