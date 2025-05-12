import {
  Component,
  Injector,
  Input,
  EventEmitter,
  Output,
} from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalRef } from "ngx-bootstrap/modal";
import {
  CreateStudentDto,
  StudentServiceProxy,
  CourseDto,
  Gender,
  CountryDto,
  StateDto,
  CityDto,
} from "./../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "./../../../../shared/app-component-base";
import { SharedModule } from "./../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import moment from "moment";

@Component({
  selector: "app-create-student-dialog",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./create-student-dialog.component.html",
  styleUrl: "./create-student-dialog.component.css",
})
export class CreateStudentDialogComponent extends AppComponentBase {
  saving = false;
  student = new CreateStudentDto();
  selectedDate: string = "";
  selectedGender: Gender;
  // showCountryWarning = false;
  // showStateWarning = false;

  @Output() onSave = new EventEmitter<any>();
  @Input() courses: CourseDto[] = [];
  @Input() countries: CountryDto[] = [];
  @Input() states: StateDto[] = [];
  @Input() cities: CityDto[] = [];

  filteredStates: StateDto[] = [];
  filteredCities: CityDto[] = [];

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _studentService: StudentServiceProxy
  ) {
    super(injector);
  }
  // onStateDropdownClick(): void {
  //   if (!this.student.countryId) {
  //     this.showCountryWarning = true;
  //   } else {
  //     this.showCountryWarning = false;
  //   }
  // }
  
  // onCityDropdownClick(): void {
  //   if (!this.student.stateId) {
  //     this.showStateWarning = true;
  //   } else {
  //     this.showStateWarning = false;
  //   }
  // }

  ngOnInit() {
    this.student.dob = moment(this.selectedDate);
    if (this.student.gender !== undefined) {
      this.selectedGender = this.student.gender;
    }

    if (this.student.countryId) {
      this.onCountryChange(this.student.countryId);
    }
    if (this.student.stateId) {
      this.onStateChange(this.student.stateId);
    }
  }

  onCountryChange(countryId: number): void {
    this.filteredStates = this.states.filter(s => s.countryId === +countryId);
    this.filteredCities = [];
    this.student.stateId = undefined;
    this.student.cityId = undefined;
  }

  onStateChange(stateId: number): void {
    this.filteredCities = this.cities.filter(c => c.stateId === +stateId);
    this.student.cityId = undefined;
  }

  save(): void {
    this.saving = true;
    if (!this.selectedDate) {
      this.notify.warn("Please select a valid Date of Birth.");
      this.saving = false;
      return;
    }

    const selectedDOB = moment(this.selectedDate);
    const today = moment().startOf('day');

    if (!selectedDOB.isBefore(today)) {
      this.notify.warn("Date of Birth cannot be today or a future date.");
      this.saving = false;
      return;
    }
    this.student.dob = selectedDOB;
    this.student.gender = this.selectedGender;

    this._studentService
      .create(this.student)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.notify.info(this.l("Saved Successfully"));
          this.bsModalRef.hide();
          this.onSave.emit();
        })
      )
      .subscribe({
        error: (err) => {
          this.notify.error(this.l("Save Failed"));
          console.error("API call failed", err);
        },
      });
  }
}
