import {
  Component,
  Injector,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import {
  CreateDealDto,
  DealServiceProxy,
  DealWithTasksDto,
  TaskDto,
} from '../../../../shared/service-proxies/service-proxies';
import { AppComponentBase } from '../../../../shared/app-component-base';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import * as moment from 'moment';

@Component({
  selector: 'app-deal-form-dialog',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './deal-form-dialog.component.html',
  styleUrls: ['./deal-form-dialog.component.css'],
})
export class DealFormDialogComponent extends AppComponentBase implements OnInit {
  @Input() deal: DealWithTasksDto | CreateDealDto | null = null;
  @Output() onSave = new EventEmitter<void>();

  saving = false;
  isEditMode = false;
  selectedDealDate: string = '';
  selectedTaskDateFrom: string = '';
  selectedTaskToDate: string = '';

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _dealService: DealServiceProxy,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

ngOnInit(): void {
  if (this.deal && 'id' in this.deal && this.deal.id) {
    this.isEditMode = true;
    if (this.deal.createdDate) {
      this.selectedDealDate = moment(this.deal.createdDate).format('YYYY-MM-DD');
    }
    if (this.deal.tasks.length > 0) {
      this.deal.tasks.forEach(task => {
      task.date_From = moment(task.date_From).format('YYYY-MM-DD') as any;
      task.to_Date = moment(task.to_Date).format('YYYY-MM-DD') as any;
      });
    }
  } else {
    this.isEditMode = false;
    if (!this.deal) {
      this.deal = new CreateDealDto();
    }
  }
  if (!this.deal.tasks) {
    this.deal.tasks = [];
  }
}


  addTask(): void {
    const newTask = new TaskDto();
    newTask.task_Number = "";
    newTask.title = '';
    newTask.description = '';
    newTask.date_From = moment();
    newTask.to_Date = moment();
    this.deal?.tasks.push(newTask);
    this.cdr.detectChanges();
  }

  removeTask(index: number): void {
    this.deal?.tasks.splice(index, 1);
  }

 save(): void {
  if (!this.deal) return;

  this.saving = true;

  const formattedDealDate = moment(this.selectedDealDate, 'YYYY-MM-DD');
  if (!formattedDealDate.isValid()) {
    this.notify.error('Invalid deal date');
    this.saving = false;
    return;
  }
  this.deal.createdDate = formattedDealDate;

for (const task of this.deal.tasks) {
  const from = moment(task.date_From, 'YYYY-MM-DD');
  const to = moment(task.to_Date, 'YYYY-MM-DD');
  task.date_From = from;
  task.to_Date = to;
}


  const save$ = this.isEditMode
    ? this._dealService.update(this.deal as DealWithTasksDto)
    : this._dealService.create(this.deal as CreateDealDto);

  save$
    .pipe(finalize(() => (this.saving = false)))
    .subscribe({
      next: () => {
        this.notify.success(this.l('SavedSuccessfully'));
        this.onSave.emit();
        this.bsModalRef.hide();
      },
      error: (err) => {
        this.notify.error(this.l('SaveFailed'));
        console.error('Save failed:', err);
      },
    });
}
}
