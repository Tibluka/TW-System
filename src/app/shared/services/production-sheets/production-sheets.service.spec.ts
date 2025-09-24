import { TestBed } from '@angular/core/testing';

import { ProductionSheetsService } from './production-sheets.service';

describe('ProductionSheetsService', () => {
  let service: ProductionSheetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionSheetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
