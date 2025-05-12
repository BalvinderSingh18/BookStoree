import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  OnInit,
  Output,
} from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalRef } from "ngx-bootstrap/modal";
import { SharedModule } from "../../../../shared/shared.module";

import {
  CourseDto,
  CourseServiceProxy,
} from "../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "../../../../shared/app-component-base";
import { CommonModule } from "@node_modules/@angular/common";

@Component({
  selector: "app-edit-course-dialog",
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: "./edit-course-dialog.component.html",
  styleUrl: "./edit-course-dialog.component.css",
})
export class EditCourseDialogComponent extends AppComponentBase {
  saving = false;
  course: CourseDto = new CourseDto();
  id: number;
  selectedDate: string = "";

  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public _courseService: CourseServiceProxy,
    public bsModelRef: BsModalRef,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

  save(): void {
    this.saving = true;

    this._courseService.update(this.course).subscribe(
      () => {
        this.notify.info(this.l("Saved Successfully"));
        this.bsModelRef.hide();
        this.onSave.emit();
      },
      () => {
        this.saving = false;
      }
    );
  }
}
