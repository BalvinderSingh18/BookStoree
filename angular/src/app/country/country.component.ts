import { EditCountryDialogComponent } from './edit-country/edit-country-dialog/edit-country-dialog.component';
import { CreateCountryDialogComponent } from './create-country/create-country-dialog/create-country-dialog.component';
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
  CountryDto,
  CountryServiceProxy,
  CourseDto,
  CreateCountryDto,
} from "./../../shared/service-proxies/service-proxies";

class PagedCouseRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './country.component.html',
  styleUrl: './country.component.css',
  animations: [appModuleAnimation()],
})
export class CountryComponent extends PagedListingComponentBase<CountryDto> {
  countries: CountryDto[] = [];
  isActive: boolean | null;
  keyword = "";
  sorting = "name asc";
  advancedFiltersVisible = false;
  constructor(
    injector: Injector,
    private _countryService: CountryServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  createCountry(): void {
    const createDialog = this._modalService.show(CreateCountryDialogComponent, {
      class: "modal-lg",
    });
    (createDialog.content as CreateCountryDialogComponent).onSave.subscribe(
      () => {
        this.refresh();
      }
    );
  }

  editCountry(country: CreateCountryDto): void {
    const editDialog = this._modalService.show(EditCountryDialogComponent, {
      class: "modal-lg",
      initialState: {
        country: Object.assign({}, country),
      },
    });
    (editDialog.content as EditCountryDialogComponent).onSave.subscribe(() => {
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

    this._countryService //api call
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.countries = result.items;
        this.showPaging(result, pageNumber);
      });
  }

  protected delete(country: CountryDto): void {
    debugger;
    abp.message.confirm(
      this.l("Delete Warning Message", country.name),
      undefined,
      (result: boolean) => {
        if (result) {
          this._countryService.delete(country.id).subscribe(() => {
            abp.notify.success(this.l("Successfully Deleted"));
            this.refresh();
          });
        }
      }
    );
  }
}
