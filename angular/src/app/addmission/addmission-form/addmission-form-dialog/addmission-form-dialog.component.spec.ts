import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddmissionFormDialogComponent } from './addmission-form-dialog.component';

describe('AddmissionFormDialogComponent', () => {
  let component: AddmissionFormDialogComponent;
  let fixture: ComponentFixture<AddmissionFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddmissionFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddmissionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
