import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBookDialogComponent } from './create-book-dialog.component';

describe('CreateBookDialogComponent', () => {
  let component: CreateBookDialogComponent;
  let fixture: ComponentFixture<CreateBookDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBookDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBookDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
