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
  CountryDto,
  CountryServiceProxy,
  CourseServiceProxy,
} from "../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "../../../../shared/app-component-base";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-edit-country-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './edit-country-dialog.component.html',
  styleUrl: './edit-country-dialog.component.css'
})
export class EditCountryDialogComponent extends AppComponentBase {
  saving = false;
  country: CountryDto = new CountryDto();
  id: number;
  selectedDate: string = "";

  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public _countryService: CountryServiceProxy,
    public bsModelRef: BsModalRef,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

  save(): void {
    this.saving = true;

    this._countryService.update(this.country).subscribe(
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
