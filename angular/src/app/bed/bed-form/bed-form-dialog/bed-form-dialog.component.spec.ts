import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedFormDialogComponent } from './bed-form-dialog.component';

describe('BedFormDialogComponent', () => {
  let component: BedFormDialogComponent;
  let fixture: ComponentFixture<BedFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
