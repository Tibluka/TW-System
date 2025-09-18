import { TestBed } from '@angular/core/testing';

import { ProductionOrderService } from './production-order.service';

describe('ProductionOrderService', () => {
  let service: ProductionOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
