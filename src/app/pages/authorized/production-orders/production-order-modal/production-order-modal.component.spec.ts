import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionOrderModalComponent } from './production-order-modal.component';

describe('ProductionOrderModalComponent', () => {
  let component: ProductionOrderModalComponent;
  let fixture: ComponentFixture<ProductionOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionOrderModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
