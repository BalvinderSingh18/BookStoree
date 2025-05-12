import { Component, Injector, ChangeDetectorRef, OnInit } from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";
import {
  StudentDto,
  StudentServiceProxy,
  CourseDto,
  CourseServiceProxy,
  CountryDto,
  CountryServiceProxy,
  StateDto,
  StateServiceProxy,
  CityDto,
  CityServiceProxy,
} from "./../../shared/service-proxies/service-proxies";
import { CreateStudentDialogComponent } from "./create-student/create-student-dialog/create-student-dialog.component";
import { EditStudentDialogComponent } from "./edit-student/edit-student-dialog/edit-student-dialog.component";
import { SharedModule } from "@shared/shared.module";
import { CommonModule } from "@angular/common";
import { appModuleAnimation } from "@shared/animations/routerTransition";

class PagedCourseRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: "app-student",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.css"],
  animations: [appModuleAnimation()],
})
export class StudentComponent extends PagedListingComponentBase<StudentDto> {
  students: StudentDto[] = [];
  courses: CourseDto[] = [];
  countries: CountryDto[] = [];
  states: StateDto[] = [];
  cities: CityDto[] = [];
  filteredStates: StateDto[] = [];
  filteredCities: CityDto[] = [];
  isActive: boolean | null = null;
  keyword = "";
  advancedFiltersVisible = false;
  sorting = "name asc";

  constructor(
    injector: Injector,
    private _studentService: StudentServiceProxy,
    private _courseService: CourseServiceProxy,
    private _countryService: CountryServiceProxy,
    private _stateService: StateServiceProxy,
    private _cityService: CityServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadCountries();
    this.loadStates();
    this.loadCities();
    this.getDataPage(1);
  }

  loadCourses(): void {
    this._courseService.getAll("", undefined, 0, 1000).subscribe((result) => {
      this.courses = result.items;
    });
  }

  loadCountries(): void {
    this._countryService.getAll("", undefined, 0, 1000).subscribe((result) => {
      this.countries = result.items;
    });
  }

  loadStates(): void {
    this._stateService.getAll("", undefined, 0, 1000).subscribe((result) => {
      this.states = result.items;
    });
  }

  loadCities(): void {
    this._cityService.getAll("", undefined, 0, 1000).subscribe((result) => {
      this.cities = result.items;
    });
  }

  createStudent(): void {
    const createDialog = this._modalService.show(CreateStudentDialogComponent, {
      class: "modal-lg",
      initialState: {
        courses: this.courses,
        countries: this.countries,
        states: this.states,
        cities: this.cities,
      },
    });

    (createDialog.content as CreateStudentDialogComponent).onSave.subscribe(
      () => {
        this.getDataPage(1);
      }
    );
  }

  editStudent(student: StudentDto): void {
    const editDialog = this._modalService.show(EditStudentDialogComponent, {
      class: "modal-lg",
      initialState: {
        student: Object.assign({}, student),
        courses: this.courses,
        countries: this.countries,
        states: this.states,
        cities: this.cities,
      },
    });

    (editDialog.content as EditStudentDialogComponent).onSave.subscribe(() => {
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
    request: PagedCourseRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._studentService
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.students = result.items;
        this.showPaging(result, pageNumber);
        this.cd.detectChanges();
      });
  }

  protected delete(student: StudentDto): void {
    abp.message.confirm(
      this.l("Delete Warning Message", student.name),
      undefined,
      (result: boolean) => {
        if (result) {
          this._studentService.delete(student.id).subscribe(() => {
            abp.notify.success(this.l("SuccessfullyDeleted"));
            this.getDataPage(1);
          });
        }
      }
    );
  }

  getGenderString(gender: number): string {
    switch (gender) {
      case 0:
        return "Male";
      case 1:
        return "Female";
      case 2:
        return "Other";
      default:
        return "Unknown";
    }
  }
}
