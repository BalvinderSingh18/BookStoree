import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddmissionComponent } from './addmission.component';

describe('AddmissionComponent', () => {
  let component: AddmissionComponent;
  let fixture: ComponentFixture<AddmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
