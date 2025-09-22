import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevelopmentModalComponent } from './development-modal.component';

describe('DevelopmentModalComponent', () => {
  let component: DevelopmentModalComponent;
  let fixture: ComponentFixture<DevelopmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevelopmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
