import { Component, Injector } from "@angular/core";
import { finalize } from "rxjs/operators";
import { EventEmitter, Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import {
  CreateCountryDto,
  CountryServiceProxy,
} from "./../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "../../../../shared/app-component-base";
import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
@Component({
  selector: 'app-create-country-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './create-country-dialog.component.html',
  styleUrl: './create-country-dialog.component.css'
})
export class CreateCountryDialogComponent extends AppComponentBase {
  saving = false;
  country = new CreateCountryDto();
  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _countryService: CountryServiceProxy
  ) {
    super(injector);
  }
  save(): void {
    this.saving = true;

    this._countryService
      .create(this.country)
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
