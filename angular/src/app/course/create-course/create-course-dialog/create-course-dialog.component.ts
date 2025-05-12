import { Component, Injector } from "@angular/core";
import { finalize } from "rxjs/operators";
import { EventEmitter, Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import {
  CreateCourseDto,
  CourseServiceProxy,
} from "./../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "../../../../shared/app-component-base";
import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-create-course-dialog",
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: "./create-course-dialog.component.html",
  styleUrl: "./create-course-dialog.component.css",
})
export class CreateCourseDialogComponent extends AppComponentBase {
  saving = false;
  course = new CreateCourseDto();
  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _courseService: CourseServiceProxy
  ) {
    super(injector);
  }
  save(): void {
    this.saving = true;

    this._courseService
      .create(this.course)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.notify.info(this.l("Saved Successfully"));
          this.bsModalRef.hide();
          this.onSave.emit();
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          this.notify.error(this.l("Save Failed"));
          console.error("API call failed", err);
        },
      });
  }
}
