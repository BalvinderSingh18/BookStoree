import {
  Component,
  Injector,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from "@angular/core";
import { finalize } from "rxjs/operators";
import * as signalR from "@microsoft/signalr";
import { BsModalService } from "ngx-bootstrap/modal";
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import {
  TaskManagementDto,
  TaskManagementServiceProxy,
  TaskUserDto
} from "@shared/service-proxies/service-proxies";
import { TaskFormDialogComponent } from "./task-form/task-form-dialog/task-form-dialog.component";
import {
  PagedListingComponentBase,
  PagedRequestDto
} from "shared/paged-listing-component-base";

class PagedCourseRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-taskmanagements',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './taskmanagements.component.html',
  styleUrl: './taskmanagements.component.css'
})
export class TaskmanagementsComponent extends PagedListingComponentBase<TaskManagementDto> implements OnInit, OnDestroy {
  tasks: TaskManagementDto[] = [];
  isActive: boolean | null = null;
  keyword = "";
  canCreate = false;
  canDelete = false;
  advancedFiltersVisible = false;
  sorting = "name asc";
  users: TaskUserDto[] = [];
  private hubConnection: signalR.HubConnection;

  constructor(
    injector: Injector,
    private _taskManagementServiceProxy: TaskManagementServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this.getDataPage(1);
    this.loadUsers();
    this.initializeSignalRConnection();
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  initializeSignalRConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("/taskDiscussionHub")
      .build();

    this.hubConnection.start().catch(err => console.error("SignalR Connection Error:", err));

    this.hubConnection.on("ReceiveDiscussionUpdate", (taskId: number, discussion: string) => {
      abp.notify.info(`New update on Task ${taskId}: ${discussion}`);
      this.getDataPage(1);
    });
  }

  loadUsers(): void {
    this._taskManagementServiceProxy.getAllUsersForTask().subscribe(result => {
      this.users = result.items;
    });
  }

  openTaskMForm(task?: TaskManagementDto): void {
    const dialog = this._modalService.show(TaskFormDialogComponent, {
      class: 'modal-lg',
      initialState: {
        task: task ? Object.assign({}, task) : null,
        users: this.users,
      },
    });

    (dialog.content as TaskFormDialogComponent).onSave.subscribe(() => {
      this.getDataPage(1); 
    });
  }

  createTask(): void {
    this.openTaskMForm();
  }

  editTask(task: TaskManagementDto): void {
    this.openTaskMForm(task);
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
    request: PagedCourseRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._taskManagementServiceProxy
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.tasks = result.items;
        this.showPaging(result, pageNumber);
        this.cd.detectChanges();
      });
  }

  protected delete(task: TaskManagementDto): void {
    abp.message.confirm(
      this.l("Delete Warning Message", task.title),
      undefined,
      (result: boolean) => {
        if (result) {
          this._taskManagementServiceProxy.delete(task.id).subscribe(() => {
            abp.notify.success(this.l("SuccessfullyDeleted"));
            this.getDataPage(1);
          });
        }
      }
    );
  }

  getStatusString(status: number): string {
    switch (status) {
      case 0:
        return "New";
      case 1:
        return "InProgress";
      case 2:
        return "Complete";
      default:
        return "Unknown";
    }
  }
}
