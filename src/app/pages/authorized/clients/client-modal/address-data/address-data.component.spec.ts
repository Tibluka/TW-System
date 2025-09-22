import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressDataComponent } from './address-data.component';

describe('AddressDataComponent', () => {
  let component: AddressDataComponent;
  let fixture: ComponentFixture<AddressDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddressDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
