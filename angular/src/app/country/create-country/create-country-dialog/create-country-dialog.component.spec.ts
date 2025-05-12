import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCountryDialogComponent } from './create-country-dialog.component';

describe('CreateCountryDialogComponent', () => {
  let component: CreateCountryDialogComponent;
  let fixture: ComponentFixture<CreateCountryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCountryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCountryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
