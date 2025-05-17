import { Component, Injector, ChangeDetectorRef, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import {
  DealServiceProxy,
  DealWithTasksDto,
  TaskDto,
} from './../../shared/service-proxies/service-proxies';
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from 'shared/paged-listing-component-base';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import{DealFormDialogComponent} from "./deal-form/deal-form-dialog/deal-form-dialog.component";

class PagedDepartmentRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-deal',
  standalone: true,
  imports: [SharedModule, CommonModule,DealFormDialogComponent, ],
  templateUrl: './deal.component.html',
  styleUrl: './deal.component.css',
  animations: [appModuleAnimation()],
})
export class DealComponent extends PagedListingComponentBase<DealWithTasksDto> implements OnInit {
  dealWithTasks: (DealWithTasksDto & { showTasks?: boolean })[] = [];
  tasks: TaskDto[]=[];
  isActive: boolean | null = null;
  keyword = '';
  advancedFiltersVisible = false;
  sorting = 'name asc';

  constructor(
    injector: Injector,
    private _dealService: DealServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this.getDataPage(1);

  }

openDealForm(deal?: DealWithTasksDto): void {
  const modalRef = this._modalService.show(DealFormDialogComponent, {
    class: 'modal-lg',
    initialState: {
    deal: deal ? Object.assign({}, deal) : null
    },
  });

  if (modalRef.content && modalRef.content.onSave) {
    modalRef.content.onSave.subscribe(() => this.refresh());
  }
}


  createDeal(): void {
    this.openDealForm();
  }

  editDeal(deal: DealWithTasksDto): void {
    this.openDealForm(deal);
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

    this._dealService
      .getAll(request.keyword, this.sorting, request.skipCount, request.maxResultCount)
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.dealWithTasks = result.items.map((deal: DealWithTasksDto) => ({
          ...deal,
          showTasks: false, // collapsed by default
        }));

        this.showPaging(result, pageNumber);
        this.cd.detectChanges();
      });
  }

protected delete(deal: DealWithTasksDto): void {
  abp.message.confirm(
    this.l('Delete Warning Message', deal.name),
    undefined,
    (result: boolean) => {
      if (result) {
        this._dealService.delete('deal', deal.id).subscribe(() => {
          abp.notify.success(this.l('SuccessfullyDeleted'));
          this.getDataPage(1);
        });
      }
    }
  );
}
deleteTask(task: TaskDto): void {
  abp.message.confirm(
    this.l('Delete Task Warning Message', task.title),
    undefined,
    (result: boolean) => {
      if (result) {
        this._dealService.delete('task', task.id).subscribe(() => {
          abp.notify.success(this.l('SuccessfullyDeleted'));
          this.getDataPage(1);
        });
      }
    }
  );
}


  toggleTasks(deal: DealWithTasksDto & { showTasks?: boolean }) {
    deal.showTasks = !deal.showTasks;
  }
}
