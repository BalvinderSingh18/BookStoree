import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalRef } from "ngx-bootstrap/modal";
import { SharedModule } from "../../../../shared/shared.module";

import {
  CityDto,
  CityServiceProxy,
  StateDto,
} from "../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "../../../../shared/app-component-base";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-edit-city-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './edit-city-dialog.component.html',
  styleUrl: './edit-city-dialog.component.css'
})
export class EditCityDialogComponentt extends AppComponentBase {
  saving = false;
  city: CityDto = new CityDto();
  @Input() states: StateDto[] = [];
  id: number;
  selectedDate: string = "";

  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public _cityService: CityServiceProxy,
    public bsModelRef: BsModalRef,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

  save(): void {
    this.saving = true;

    this._cityService.update(this.city).subscribe(
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
