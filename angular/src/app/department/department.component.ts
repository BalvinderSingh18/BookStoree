import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { SharedModule } from "@shared/shared.module";
import { CommonModule } from "@angular/common";
import{DepartmentFormDialogComponent} from "./department-form/department-form-dialog/department-form-dialog.component";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";

class PagedDepartmentRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}
import {
  DepartmentDto,
  DepartmentServiceProxy,
} from "@shared/service-proxies/service-proxies";
@Component({
  selector: 'app-department',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './department.component.html',
  styleUrl: './department.component.css',
  animations: [appModuleAnimation()],
})
export class DepartmentComponent extends PagedListingComponentBase<DepartmentDto> {
  departments: DepartmentDto[] = [];
  isActive: boolean | null;
  keyword = "";
  sorting = 'name asc';
  advancedFiltersVisible = false;

  constructor(
    injector: Injector,
    private _departmentService: DepartmentServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  openBookForm(department?: DepartmentDto): void {
    const dialog = this._modalService.show(DepartmentFormDialogComponent, {
      class: 'modal-lg',
      initialState: {
        department: department ? Object.assign({}, department) : null
      }
    });
  
    (dialog.content as DepartmentFormDialogComponent).onSave.subscribe(() => {
      this.refresh();
    });
  }

  createDepartment(): void {
    this.openBookForm();
  }
  
  editDepartment(department: DepartmentDto): void {
    this.openBookForm(department);
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
    request: PagedDepartmentRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._departmentService //api call
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.departments = result.items;
        this.showPaging(result, pageNumber);
      });
  }

  protected delete(department: DepartmentDto): void {
    debugger;
    abp.message.confirm(
      this.l("Delete Warning Message", department.name),
      undefined,
      (result: boolean) => {
        if (result) {
          this._departmentService.delete(department.id).subscribe(() => {
            abp.notify.success(this.l("Successfully Deleted"));
            this.refresh();
          });
        }
      }
    );
  }
}
