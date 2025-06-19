import {
  Component,
  Injector,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { AppComponentBase } from "../../../../shared/app-component-base";

import {
  CreateTaskManagementDto,
  TaskManagementDto,
  TaskManagementServiceProxy,
  TaskStatus,
  TaskUserDto,
} from "../../../../shared/service-proxies/service-proxies";
import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import * as signalR from "@microsoft/signalr";

@Component({
  selector: "app-task-form-dialog",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./task-form-dialog.component.html",
  styleUrl: "./task-form-dialog.component.css",
})
export class TaskFormDialogComponent
  extends AppComponentBase
  implements OnInit
{
  @Input() task: TaskManagementDto | CreateTaskManagementDto | null = null;
  @Input() users: TaskUserDto[] = [];
  @Output() onSave = new EventEmitter<any>();

  selectedStatus: TaskStatus;
  isEditMode = false;
  isAdmin: boolean = false;
  saving = false;
  private hubConnection: signalR.HubConnection;

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _taskService: TaskManagementServiceProxy,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

ngOnInit(): void {
  this.connectToSignalR();
  
  if (this.task && "id" in this.task && this.task.id) {
    this.isEditMode = true;
    this.selectedStatus = this.task.taskStatus;
  } else {
    if (!this.task) {
      this.task = new CreateTaskManagementDto();
    }
  }
}

ngAfterViewInit(): void {
  Promise.resolve().then(() => {
    this.isAdmin = this.permission.isGranted("Pages.TaskManagement.Admin");
    this.cd.detectChanges(); // Ensures Angular acknowledges the change post-view initialization
  });
}



  save(): void {
    if (!this.task) return;

    this.saving = true;
    this.task.taskStatus = this.selectedStatus;

    if (!this.isAdmin) {
      this.task.discussion = null; // Only admin can set discussion
    }

    const save$ = this.isEditMode
      ? this._taskService.update(this.task as TaskManagementDto)
      : this._taskService.create(this.task as CreateTaskManagementDto);

    save$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.notify.success(this.l("SavedSuccessfully"));
        this.onSave.emit();
        this.bsModalRef.hide();
      },
      error: (err) => {
        this.notify.error(this.l("SaveFailed"));
        console.error("Save failed:", err);
      },
    });
  }
private connectToSignalR() {
this.hubConnection = new signalR.HubConnectionBuilder()
  .withUrl("https://localhost:44311/signalr-task-discussion")
  .build();

  this.hubConnection
    .start()
    .then(() => console.log("✅ SignalR connected"))
    .catch((err) => console.error("❌ SignalR Connection Error:", err));

  this.hubConnection.on("ReceiveDiscussionUpdate", (taskId: number, discussion: string) => {
    console.log("📩 Received discussion update:", taskId, discussion);
    if (this.task?.id === taskId) {
      this.task.discussion = discussion;
      this.notify.info("Discussion updated in real time.");
    }
  });
}

}
