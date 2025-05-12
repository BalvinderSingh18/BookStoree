import { BedFormDialogComponent } from "./bed-form/bed-form-dialog/bed-form-dialog.component";
import { Component, Injector, ChangeDetectorRef, OnInit } from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";
import {
  BedDto,
  BedServiceProxy,
} from "./../../shared/service-proxies/service-proxies";
import { SharedModule } from "@shared/shared.module";
import { CommonModule } from "@angular/common";
import { appModuleAnimation } from "@shared/animations/routerTransition";

class PagedBedRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: "app-bed",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./bed.component.html",
  styleUrls: ["./bed.component.css"],
  animations: [appModuleAnimation()],
})
export class BedComponent
  extends PagedListingComponentBase<BedDto>
  implements OnInit
{
  beds: BedDto[] = [];
  isActive: boolean | null = null;
  keyword = "";
  advancedFiltersVisible = false;
  sorting = "name asc";

  constructor(
    injector: Injector,
    private _bedService: BedServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this.getDataPage(1);
  }
  openBedForm(bed?: BedDto): void {
    const dialog = this._modalService.show(BedFormDialogComponent, {
      class: "modal-lg",
      initialState: {
        bed: bed ? Object.assign({}, bed) : null,
      },
    });

    (dialog.content as BedFormDialogComponent).onSave.subscribe(() => {
      this.refresh();
    });
  }

  createBed(): void {
    this.openBedForm();
  }

  editBed(bed: BedDto): void {
    this.openBedForm(bed);
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
    request: PagedBedRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._bedService
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.beds = result.items;
        this.showPaging(result, pageNumber);
        this.cd.detectChanges();
      });
  }

  protected delete(bed: BedDto): void {
    abp.message.confirm(
      this.l("Delete Warning Message", bed.id),
      undefined,
      (result: boolean) => {
        if (result) {
          this._bedService.delete(bed.id).subscribe(() => {
            abp.notify.success(this.l("SuccessfullyDeleted"));
            this.getDataPage(1);
          });
        }
      }
    );
  }

  getTypeString(type: number): string {
    switch (type) {
      case 0:
        return "ICU";
      case 1:
        return "General";
      case 2:
        return "Etc";
      default:
        return "Unknown";
    }
  }

  getStatusString(status: number): string {
    switch (status) {
      case 0:
        return "Available";
      case 1:
        return "Occupied";
      case 2:
        return "Blocked";
      default:
        return "Unknown";
    }
  }
}
