import { EditCourseDialogComponent } from "./edit-course/edit-course-dialog/edit-course-dialog.component";
import { CreateCourseDialogComponent } from "./create-course/create-course-dialog/create-course-dialog.component";
import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";
import { SharedModule } from "@shared/shared.module";
import { CommonModule } from "@node_modules/@angular/common";
import {
  CourseDto,
  CourseServiceProxy,
  CreateCourseDto,
} from "./../../shared/service-proxies/service-proxies";

class PagedCouseRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: "app-course",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./course.component.html",
  styleUrl: "./course.component.css",
  animations: [appModuleAnimation()],
})
export class CourseComponent extends PagedListingComponentBase<CourseDto> {
  courses: CourseDto[] = [];
  isActive: boolean | null;
  keyword = "";
  sorting = "name asc";
  advancedFiltersVisible = false;
  constructor(
    injector: Injector,
    private _courseService: CourseServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  createCourse(): void {
    const createDialog = this._modalService.show(CreateCourseDialogComponent, {
      class: "modal-lg",
    });
    (createDialog.content as CreateCourseDialogComponent).onSave.subscribe(
      () => {
        this.refresh();
      }
    );
  }

  editCourse(course: CreateCourseDto): void {
    const editDialog = this._modalService.show(EditCourseDialogComponent, {
      class: "modal-lg",
      initialState: {
        course: Object.assign({}, course), // Clone data to prevent 2-way binding issues
      },
    });
    (editDialog.content as EditCourseDialogComponent).onSave.subscribe(() => {
      this.refresh();
    });
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
    request: PagedCouseRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._courseService //api call
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.courses = result.items;
        this.showPaging(result, pageNumber);
      });
  }

  protected delete(book: CourseDto): void {
    debugger;
    abp.message.confirm(
      this.l("Delete Warning Message", book.name),
      undefined,
      (result: boolean) => {
        if (result) {
          this._courseService.delete(book.id).subscribe(() => {
            abp.notify.success(this.l("Successfully Deleted"));
            this.refresh();
          });
        }
      }
    );
  }
}
