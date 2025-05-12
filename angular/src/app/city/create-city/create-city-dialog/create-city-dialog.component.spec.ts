import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCityDialogComponent } from './create-city-dialog.component';

describe('CreateCityDialogComponent', () => {
  let component: CreateCityDialogComponent;
  let fixture: ComponentFixture<CreateCityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCityDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
