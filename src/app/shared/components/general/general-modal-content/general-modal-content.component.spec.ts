import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralModalContentComponent } from './general-modal-content.component';

describe('GeneralModalContentComponent', () => {
  let component: GeneralModalContentComponent;
  let fixture: ComponentFixture<GeneralModalContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralModalContentComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GeneralModalContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
