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
  AddmissionDto,
  AddmissionServiceProxy,
  BedDto,
  CreateAddmissionDto,
  PatientDto,
} from "../../../../shared/service-proxies/service-proxies";
import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import moment from "moment";

@Component({
  selector: "app-addmission-form-dialog",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./addmission-form-dialog.component.html",
  styleUrls: ["./addmission-form-dialog.component.css"],
})
export class AddmissionFormDialogComponent
  extends AppComponentBase
  implements OnInit
{
  @Input() addmission: AddmissionDto | CreateAddmissionDto | null = null;
  @Input() beds: BedDto[] = [];
  @Input() patients: PatientDto[] = [];
  @Output() onSave = new EventEmitter<any>();

  saving = false;
  isEditMode = false;
  selectedAdmitDate: string = "";
  selectedDischargeDate: string = "";

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _addmissionService: AddmissionServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.addmission && "id" in this.addmission && this.addmission.id) {
      this.isEditMode = true;
  
      // Ensure date is parsed correctly
      if (this.addmission.admitDate) {
        this.selectedAdmitDate = moment(this.addmission.admitDate).format("YYYY-MM-DD");
      }
  
      if (this.addmission.dischargeDate) {
        this.selectedDischargeDate = moment(this.addmission.dischargeDate).format("YYYY-MM-DD");
      }
    } else {
      this.isEditMode = false;
      if (!this.addmission) {
        this.addmission = new CreateAddmissionDto();
      }
    }
  }
  

  save(): void {
    if (!this.addmission) return;

    this.saving = true;

    const formattedAdmitDate = moment(this.selectedAdmitDate, "YYYY-MM-DD");
    const formattedDischargeDate = moment(this.selectedDischargeDate, "YYYY-MM-DD");

    this.addmission.admitDate = formattedAdmitDate;
    this.addmission.dischargeDate = formattedDischargeDate;

    const save$ = this.isEditMode
      ? this._addmissionService.update(this.addmission as AddmissionDto)
      : this._addmissionService.create(this.addmission as CreateAddmissionDto);

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
