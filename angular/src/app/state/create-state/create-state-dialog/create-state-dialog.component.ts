import { Component, Injector, Input } from "@angular/core";
import { finalize } from "rxjs/operators";
import { EventEmitter, Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import {
  CountryDto,
  CreateStateDto,
  StateServiceProxy,
} from "./../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "../../../../shared/app-component-base";
import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
@Component({
  selector: 'app-create-state-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './create-state-dialog.component.html',
  styleUrl: './create-state-dialog.component.css'
})
export class CreateStateDialogComponent extends AppComponentBase {
  saving = false;
  state = new CreateStateDto();
  @Input() countries: CountryDto[] = [];
  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _stateService: StateServiceProxy
  ) {
    super(injector);
  }
  save(): void {
    this.saving = true;

    this._stateService
      .create(this.state)
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
