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
import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import { AppComponentBase } from "../../../../shared/app-component-base";
import {
  CreateDepartmentDto,
  CreatePatientDto,
  DepartmentDto,
  DepartmentServiceProxy,
  Gender,
  PatientDto,
  PatientServiceProxy,
} from "../../../../shared/service-proxies/service-proxies";

@Component({
  selector: 'app-department-form-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './department-form-dialog.component.html',
  styleUrl: './department-form-dialog.component.css'
})
export class DepartmentFormDialogComponent extends AppComponentBase implements OnInit {
  @Input() department: DepartmentDto | null = null; // Input from modal caller
  @Output() onSave = new EventEmitter<any>();
  saving = false;
  isEditMode = false;

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _departmentService: DepartmentServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.department && this.department.id) {
      // Edit mode
      this.isEditMode = true;
    } else {
      // Create mode
      this.isEditMode = false;
      this.department = new CreateDepartmentDto(); // For creation
    }
  }

  save(): void {
    this.saving = true;
    const save$ = this.isEditMode
      ? this._departmentService.update(this.department!)
      : this._departmentService.create(this.department! as CreateDepartmentDto);

    save$
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: () => {
          this.notify.success(this.l("SavedSuccessfully"));
          this.bsModalRef.hide();
          this.onSave.emit();
        },
        error: (err) => {
          this.notify.error(this.l("SaveFailed"));
          console.error("Save failed:", err);
        },
      });
  }
}
