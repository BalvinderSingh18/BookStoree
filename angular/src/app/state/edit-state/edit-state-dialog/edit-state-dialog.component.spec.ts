import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStateDialogComponent } from './edit-state-dialog.component';

describe('EditStateDialogComponent', () => {
  let component: EditStateDialogComponent;
  let fixture: ComponentFixture<EditStateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
