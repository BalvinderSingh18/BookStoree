import { EditStateDialogComponent } from './edit-state/edit-state-dialog/edit-state-dialog.component';
import { CreateStateDialogComponent } from './create-state/create-state-dialog/create-state-dialog.component';
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
  StateDto,
  StateServiceProxy,
} from "./../../shared/service-proxies/service-proxies";

class PagedCouseRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: "app-state",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./state.component.html",
  styleUrl: "./state.component.css",
  animations: [appModuleAnimation()],
})
export class StateComponent extends PagedListingComponentBase<StateDto> {
  states: StateDto[] = [];
  countries: CountryDto[] = [];
  isActive: boolean | null;
  keyword = "";
  sorting = "name asc";
  advancedFiltersVisible = false;
  constructor(
    injector: Injector,
    private _stateService: StateServiceProxy,
    private _countryService: CountryServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this.loadCountries();
    this.getDataPage(1);
  }

  loadCountries(): void {
    this._countryService.getAll("", undefined, 0, 1000).subscribe((result) => {
      this.countries = result.items;
    });
  }
  createState(): void {
    const createDialog = this._modalService.show(CreateStateDialogComponent, {
      class: "modal-lg",
      initialState: {
        countries: this.countries,
      },
    });
    (createDialog.content as CreateStateDialogComponent).onSave.subscribe(
      () => {
        this.refresh();
      }
    );
  }

  editState(state: StateDto): void {
    const editDialog = this._modalService.show(EditStateDialogComponent, {
      class: "modal-lg",
      initialState: {
        state: Object.assign({}, state),
        countries:this.countries,
      },
    });
    (editDialog.content as EditStateDialogComponent).onSave.subscribe(() => {
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

    this._stateService //api call
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.states = result.items;
        this.showPaging(result, pageNumber);
      });
  }

  protected delete(state: StateDto): void {
    debugger;
    abp.message.confirm(
      this.l("Delete Warning Message", state.name),
      undefined,
      (result: boolean) => {
        if (result) {
          this._stateService.delete(state.id).subscribe(() => {
            abp.notify.success(this.l("Successfully Deleted"));
            this.refresh();
          });
        }
      }
    );
  }
}
