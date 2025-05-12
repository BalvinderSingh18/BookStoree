import { PatientFormDialogComponent } from './patient-form/patient-form-dialog/patient-form-dialog.component';
import { Component, Injector, ChangeDetectorRef, OnInit } from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";
import {
  PatientDto,
  PatientServiceProxy,
} from "./../../shared/service-proxies/service-proxies";
import { SharedModule } from "@shared/shared.module";
import { CommonModule } from "@angular/common";
import { appModuleAnimation } from "@shared/animations/routerTransition";

class PagedPatientRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css',
  animations: [appModuleAnimation()],
})
export class PatientComponent extends PagedListingComponentBase<PatientDto>implements OnInit{
  patients: PatientDto[] = [];
  isActive: boolean | null = null;
  keyword = "";
  advancedFiltersVisible = false;
  sorting = "name asc";

  constructor(
    injector: Injector,
    private _patientService: PatientServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this.getDataPage(1);
  }
  openPatientForm(patient?: PatientDto): void {
    const dialog = this._modalService.show(PatientFormDialogComponent, {
      class: "modal-lg",
      initialState: {
        patient: patient ? Object.assign({}, patient) : null,
      },
    });

    (dialog.content as PatientFormDialogComponent).onSave.subscribe(() => {
      this.refresh();
    });
  }

  createPatient(): void {
    this.openPatientForm();
  }

  editPatient(patient: PatientDto): void {
    this.openPatientForm(patient);
  }

  changeSorting(field: string): void {
    const isAsc = this.sorting === `${field} asc`;
    this.sorting = isAsc ? `${field} desc` : `${field} asc`;
    this.refresh();
  }

  clearFilters(): void {
    this.keyword = "";
    this.getDataPage(1);
  }

  protected list(
    request: PagedPatientRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._patientService
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.patients = result.items;
        this.showPaging(result, pageNumber);
        this.cd.detectChanges();
      });
  }

  protected delete(patient: PatientDto): void {
    abp.message.confirm(
      this.l("Delete Warning Message", patient.id),
      undefined,
      (result: boolean) => {
        if (result) {
          this._patientService.delete(patient.id).subscribe(() => {
            abp.notify.success(this.l("SuccessfullyDeleted"));
            this.getDataPage(1);
          });
        }
      }
    );
  }

  getGenderString(gender: number): string {
    switch (gender) {
      case 0:
        return "Male";
      case 1:
        return "Female";
      case 2:
        return "Other";
      default:
        return "Unknown";
    }
  }
}
