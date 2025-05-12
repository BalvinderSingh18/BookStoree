import { EditCityDialogComponentt } from './edit-city/edit-city-dialog/edit-city-dialog.component';
import { CreateCityDialogComponent } from './create-city/create-city-dialog/create-city-dialog.component';
import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";
import { SharedModule } from "@shared/shared.module";
import { CommonModule } from "@angular/common";
import {
  CityDto,
  CityServiceProxy,
  CountryDto,
  CountryServiceProxy,
  StateDto,
  StateServiceProxy,
} from "./../../shared/service-proxies/service-proxies";

class PagedCouseRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: "app-city",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./city.component.html",
  styleUrl: "./city.component.css",
  animations: [appModuleAnimation()],
})
export class CityComponent extends PagedListingComponentBase<CityDto> {
  cities: CityDto[] = [];
  states: StateDto[] = [];
  countries: CountryDto[] = [];
  isActive: boolean | null;
  keyword = "";
  sorting = "name asc";
  advancedFiltersVisible = false;

  constructor(
    injector: Injector,
    private _cityService: CityServiceProxy,
    private _stateService: StateServiceProxy,
    private _countryService: CountryServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadStates();
    this.getDataPage(1);
  }

  loadStates(): void {
    this._stateService.getAll("", undefined, 0, 1000).subscribe({
      next: (result) => {
        this.states = result.items;
      },
      error: (error) => {
        console.error("Error loading states:", error);
        abp.message.error("Failed to load states.");
      }
    });
  }

  loadCountries(): void {
    this._countryService.getAll("", undefined, 0, 1000).subscribe({
      next: (result) => {
        this.countries = result.items;
      },
      error: (error) => {
        console.error("Error loading countries:", error);
        abp.message.error("Failed to load countries.");
      }
    });
  }

  createCity(): void {
    const createDialog = this._modalService.show(CreateCityDialogComponent, {
      class: "modal-lg",
      initialState: {
        states: this.states,
      },
    });

    (createDialog.content as CreateCityDialogComponent).onSave.subscribe(() => {
      this.refresh();
    });
  }

  editCity(city: CityDto): void {
    const editDialog = this._modalService.show(EditCityDialogComponentt, {
      class: "modal-lg",
      initialState: {
        city: Object.assign({}, city),
        states: this.states,
      },
    });

    (editDialog.content as EditCityDialogComponentt).onSave.subscribe(() => {
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

    this._cityService
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe({
        next: (result: any) => {
          this.cities = result.items;
          this.showPaging(result, pageNumber);
        },
        error: (error) => {
          console.error("Error loading cities:", error);
          abp.message.error(
            error?.error?.error?.message || "Failed to load cities."
          );
        }
      });
  }

  protected delete(city: CityDto): void {
    abp.message.confirm(
      this.l("Delete Warning Message", city.name),
      undefined,
      (result: boolean) => {
        if (result) {
          this._cityService.delete(city.id).subscribe({
            next: () => {
              abp.notify.success(this.l("Successfully Deleted"));
              this.refresh();
            },
            error: (error) => {
              console.error("Error deleting city:", error);
              const errorMessage =
                error?.error?.error?.message ||
                "This cannot be deleted as it is assigned to a student.";
              abp.message.error(errorMessage, "Delete Failed");
            }
          });
        }
      }
    );
  }
}
