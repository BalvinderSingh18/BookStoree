import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealFormDialogComponent } from './deal-form-dialog.component';

describe('DealFormDialogComponent', () => {
  let component: DealFormDialogComponent;
  let fixture: ComponentFixture<DealFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
