import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskmanagementsComponent } from './taskmanagements.component';

describe('TaskmanagementsComponent', () => {
  let component: TaskmanagementsComponent;
  let fixture: ComponentFixture<TaskmanagementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskmanagementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskmanagementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
