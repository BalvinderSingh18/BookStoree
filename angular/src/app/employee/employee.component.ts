// employee.component.ts
import { Component, Injector, ChangeDetectorRef, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import {
  DepartmentDto,
  DepartmentServiceProxy,
  EmployeeDto,
  EmployeeServiceProxy,
} from './../../shared/service-proxies/service-proxies';
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from 'shared/paged-listing-component-base';
import { EmployeeFormDialogComponent } from './employee-form/employee-form-dialog/employee-form-dialog.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { appModuleAnimation } from '@shared/animations/routerTransition';

class PagedDepartmentRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
  animations: [appModuleAnimation()],
})
export class EmployeeComponent extends PagedListingComponentBase<EmployeeDto> implements OnInit {
  employees: EmployeeDto[] = [];
  departments: DepartmentDto[] = [];
  isActive: boolean | null = null;
  keyword = '';
  advancedFiltersVisible = false;
  sorting = 'name asc';

  constructor(
    injector: Injector,
    private _employeeService: EmployeeServiceProxy,
    private _departmentService: DepartmentServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.getDataPage(1);
  }

  loadDepartments(): void {
    this._departmentService.getAll('', undefined, 0, 1000).subscribe((result) => {
      this.departments = result.items;
    });
  }

  openEmployeeForm(employee?: EmployeeDto): void {
    const dialog = this._modalService.show(EmployeeFormDialogComponent, {
      class: 'modal-lg',
      initialState: {
        employee: employee ? Object.assign({}, employee) : null,
        departments: this.departments,
      },
    });

    (dialog.content as EmployeeFormDialogComponent).onSave.subscribe(() => {
      this.getDataPage(1); // ✅ Force grid refresh after save
    });
  }

  createEmployee(): void {
    this.openEmployeeForm();
  }

  editEmployee(employee: EmployeeDto): void {
    this.openEmployeeForm(employee);
  }

  changeSorting(field: string): void {
    const isAsc = this.sorting === `${field} asc`;
    this.sorting = isAsc ? `${field} desc` : `${field} asc`;
    this.refresh();
  }

  clearFilters(): void {
    this.keyword = '';
    this.getDataPage(1);
  }

  protected list(
    request: PagedDepartmentRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._employeeService
      .getAll(request.keyword, this.sorting, request.skipCount, request.maxResultCount)
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.employees = result.items;
        this.showPaging(result, pageNumber);
        this.cd.detectChanges();
      });
  }

  protected delete(employee: EmployeeDto): void {
    abp.message.confirm(
      this.l('Delete Warning Message', employee.id),
      undefined,
      (result: boolean) => {
        if (result) {
          this._employeeService.delete(employee.id).subscribe(() => {
            abp.notify.success(this.l('SuccessfullyDeleted'));
            this.getDataPage(1);
          });
        }
      }
    );
  }

  getGenderString(gender: number): string {
    switch (gender) {
      case 0:
        return 'Male';
      case 1:
        return 'Female';
      case 2:
        return 'Other';
      default:
        return 'Unknown';
    }
  }
}
