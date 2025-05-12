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
  CreatePatientDto,
  Gender,
  PatientDto,
  PatientServiceProxy,
} from "../../../../shared/service-proxies/service-proxies";

@Component({
  selector: 'app-patient-form-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './patient-form-dialog.component.html',
  styleUrl: './patient-form-dialog.component.css'
})
export class PatientFormDialogComponent extends AppComponentBase implements OnInit {
  @Input() patient: PatientDto | null = null; // Input from modal caller
  @Output() onSave = new EventEmitter<any>();
  selectedGender: Gender;
  saving = false;
  isEditMode = false;

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _patientService: PatientServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.patient && this.patient.id) {
      // Edit mode
      this.isEditMode = true;
      this.selectedGender = this.patient.gender;
    } else {
      // Create mode
      this.isEditMode = false;
      this.patient = new CreatePatientDto(); // For creation
    }
  }

  save(): void {
    this.saving = true;
    this.patient!.gender = this.selectedGender;
    const save$ = this.isEditMode
      ? this._patientService.update(this.patient!)
      : this._patientService.create(this.patient! as CreatePatientDto);

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
