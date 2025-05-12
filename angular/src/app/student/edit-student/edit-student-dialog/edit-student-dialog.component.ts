import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import {
  CityDto,
  CountryDto,
  CourseDto,
  Gender,
  StateDto,
  StudentDto,
  StudentServiceProxy,
} from "../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "../../../../shared/app-component-base";
import moment from "moment-timezone";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../../shared/shared.module";

@Component({
  selector: "app-edit-student-dialog",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./edit-student-dialog.component.html",
  styleUrls: ["./edit-student-dialog.component.css"],
})
export class EditStudentDialogComponent extends AppComponentBase implements OnInit {
  saving = false;
  selectedDate: string = "";
  selectedGender: Gender;
  filteredStates: StateDto[] = [];
  filteredCities: CityDto[] = [];

  @Input() student: StudentDto = new StudentDto();
  @Input() courses: CourseDto[] = [];
  @Input() countries: CountryDto[] = [];

  private _states: StateDto[] = [];
  @Input()
  set states(value: StateDto[]) {
    this._states = value;
    if (this.student?.countryId) {
      setTimeout(() => this.onCountryChange(this.student.countryId));
    }
  }
  get states(): StateDto[] {
    return this._states;
  }

  private _cities: CityDto[] = [];
  @Input()
  set cities(value: CityDto[]) {
    this._cities = value;
    if (this.student?.stateId) {
      setTimeout(() => this.onStateChange(this.student.stateId));
    }
  }
  get cities(): CityDto[] {
    return this._cities;
  }

  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    private _studentService: StudentServiceProxy,
    public bsModelRef: BsModalRef,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.student.dob) {
      this.selectedDate = moment(this.student.dob).format("YYYY-MM-DD");
    }

    if (this.student.gender !== undefined) {
      this.selectedGender = this.student.gender;
    }
  }

  onCountryChange(countryId: number): void {
    if (!countryId || !this.states) return;

    this.filteredStates = this.states.filter(s => +s.countryId === +countryId);

    if (!this.filteredStates.some(s => s.id === this.student.stateId)) {
      this.student.stateId = undefined;
      this.filteredCities = [];
      this.student.cityId = undefined;
    } else {
      this.onStateChange(this.student.stateId);
    }

    this.cd.detectChanges();
  }

  onStateChange(stateId: number): void {
    if (!stateId || !this.cities) {
      this.filteredCities = [];
      this.student.cityId = undefined;
      this.cd.detectChanges();
      return;
    }

    this.filteredCities = this.cities.filter(c => +c.stateId === +stateId);

    if (!this.filteredCities.some(c => c.id === this.student.cityId)) {
      this.student.cityId = undefined;
    }

    console.log('Filtered Cities:', this.filteredCities);
    console.log('Selected City:', this.student.cityId);

    this.cd.detectChanges();
  }

  save(): void {
    this.saving = true;
    if (!this.selectedDate) {
      this.notify.warn("Please select a valid Date of Birth.");
      this.saving = false;
      return;
    }
  
    const selectedDOB = moment(this.selectedDate).startOf('day');
    const today = moment().startOf('day');
  
    if (!selectedDOB.isBefore(today)) {
      this.notify.warn("Date of Birth cannot be today or a future date.");
      this.saving = false;
      return;
    }
  
    this.student.dob = selectedDOB;
    this.student.gender = this.selectedGender;

    this._studentService.update(this.student).subscribe(
      () => {
        this.notify.info(this.l("Saved Successfully"));
        this.bsModelRef.hide();
        this.onSave.emit();
      },
      () => {
        this.saving = false;
      }
    );
  }
}
