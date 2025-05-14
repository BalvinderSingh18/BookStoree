import {
  Component,
  Injector,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { AppComponentBase } from "../../../../shared/app-component-base";
import {
  CreateEmployeeDto,
  DepartmentDto,
  EmployeeDto,
  EmployeeServiceProxy,
  Gender,
} from "../../../../shared/service-proxies/service-proxies";
import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import moment from "@node_modules/moment-timezone";

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './employee-form-dialog.component.html',
  styleUrl: './employee-form-dialog.component.css'
})
export class EmployeeFormDialogComponent extends AppComponentBase implements OnInit{
  @Input() employee: EmployeeDto | CreateEmployeeDto | null = null;
  @Input() departments: DepartmentDto[] = [];
  @Output() onSave = new EventEmitter<any>();
  selectedGender:Gender;
  date?: string;
  saving = false;
  isEditMode = false;
  selectedDate: string = "";
  phoneNumberExists = false;

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _employeeService: EmployeeServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.employee && "id" in this.employee && this.employee.id) {
      this.isEditMode = true;
      this.selectedGender = this.employee.gender;
      // Ensure date is parsed correctly
      if (this.employee.dob) {
        this.selectedDate = moment(this.employee.dob).format("YYYY-MM-DD");
      }
    } else {
      this.isEditMode = false;
      if (!this.employee) {
        this.employee = new CreateEmployeeDto();
      }
    }
  }
  

save(): void {
  if (!this.employee) return;

  this.phoneNumberExists = false;
  this.saving = true;
  this.employee.gender = this.selectedGender;

  const formattedDate = moment(this.selectedDate, "YYYY-MM-DD");
  const today = moment().startOf("day");

  if (!formattedDate.isBefore(today)) {
    this.notify.warn("Date of Birth must be a past date.");
    this.saving = false;
    return;
  }

  this.employee.dob = formattedDate;

  const save$ = this.isEditMode
    ? this._employeeService.update(this.employee as EmployeeDto)
    : this._employeeService.create(this.employee as CreateEmployeeDto);

  save$
    .pipe(finalize(() => {
      this.saving = false;
    }))
    .subscribe({
      next: () => {
        this.notify.success(this.l("SavedSuccessfully"));
        this.onSave.emit();
        this.bsModalRef.hide();
      },
      error: (err) => {
        if (err?.error?.message === "Phone number already exists.") {
          this.phoneNumberExists = true;
        } else {
          this.phoneNumberExists = false;
          this.notify.error(this.l("SaveFailed"));
        }
        console.error("Save failed:", err);
      },
    });
  }
}
