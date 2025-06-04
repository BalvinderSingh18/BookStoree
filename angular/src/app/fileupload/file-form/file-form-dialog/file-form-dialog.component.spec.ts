import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileFormDialogComponent } from './file-form-dialog.component';

describe('FileFormDialogComponent', () => {
  let component: FileFormDialogComponent;
  let fixture: ComponentFixture<FileFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
