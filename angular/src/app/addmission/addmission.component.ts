import { AddmissionFormDialogComponent } from "./addmission-form/addmission-form-dialog/addmission-form-dialog.component";
import { Component, Injector, ChangeDetectorRef, OnInit } from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";
import {
  AddmissionDto,
  AddmissionServiceProxy,
  BedDto,
  BedServiceProxy,
  PatientDto,
  PatientServiceProxy,
} from "./../../shared/service-proxies/service-proxies";
import { SharedModule } from "@shared/shared.module";
import { CommonModule } from "@angular/common";
import { appModuleAnimation } from "@shared/animations/routerTransition";

class PagedAddmissionRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: "app-addmission",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./addmission.component.html",
  styleUrl: "./addmission.component.css",
  animations: [appModuleAnimation()],
})
export class AddmissionComponent
  extends PagedListingComponentBase<AddmissionDto>
  implements OnInit
{
  addmissions: AddmissionDto[] = [];
  beds: BedDto[] = [];
  patients: PatientDto[] = [];
  isActive: boolean | null = null;
  keyword = "";
  advancedFiltersVisible = false;
  sorting = "name asc";

  constructor(
    injector: Injector,
    private _addmissionService: AddmissionServiceProxy,
    private _bedService: BedServiceProxy,
    private _patientService: PatientServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this.loadBeds();
    this.loadPatients();
    this.getDataPage(1);
  }

  loadBeds(): void {
    this._bedService.getAll("", undefined, 0, 1000).subscribe((result) => {
      this.beds = result.items;
    });
  }
  loadPatients(): void {
    this._patientService.getAll("", undefined, 0, 1000).subscribe((result) => {
      this.patients = result.items;
    });
  }
  openPatientForm(addmission?: AddmissionDto): void {
    const dialog = this._modalService.show(AddmissionFormDialogComponent, {
      class: "modal-lg",
      initialState: {
        addmission: addmission ? Object.assign({}, addmission) : null,
        patients: this.patients=this.patients,
        beds:this.beds=this.beds,
      },
    });

    (dialog.content as AddmissionFormDialogComponent).onSave.subscribe(() => {
      this.refresh();
    });
  }

  createAddmission(): void {
    this.openPatientForm();

  }

  editAddmission(addmission: AddmissionDto): void {
    this.openPatientForm(addmission);
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
    request: PagedAddmissionRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._addmissionService
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.addmissions = result.items;
        this.showPaging(result, pageNumber);
        this.cd.detectChanges();
      });
  }

  protected delete(addmission: AddmissionDto): void {
    abp.message.confirm(
      this.l("Delete Warning Message", addmission.id),
      undefined,
      (result: boolean) => {
        if (result) {
          this._addmissionService.delete(addmission.id).subscribe(() => {
            abp.notify.success(this.l("SuccessfullyDeleted"));
            this.getDataPage(1);
          });
        }
      }
    );
  }
}
