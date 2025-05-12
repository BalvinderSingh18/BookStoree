import { Component, Injector, Input } from "@angular/core";
import { finalize } from "rxjs/operators";
import { EventEmitter, Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import {
  CityServiceProxy,
  CreateCityDto,
  StateDto,
} from "./../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "../../../../shared/app-component-base";
import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
@Component({
  selector: 'app-create-city-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './create-city-dialog.component.html',
  styleUrl: './create-city-dialog.component.css'
})
export class CreateCityDialogComponent extends AppComponentBase {
  saving = false;
  city = new CreateCityDto();
  @Input() states: StateDto[] = [];
  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _cityService: CityServiceProxy
  ) {
    super(injector);
  }
  save(): void {
    this.saving = true;

    this._cityService
      .create(this.city)
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
