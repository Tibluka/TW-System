import { TestBed } from '@angular/core/testing';

import { ProductionReceiptsService } from './production-receipt.service';

describe('ProductionReceiptsService', () => {
  let service: ProductionReceiptsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionReceiptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
