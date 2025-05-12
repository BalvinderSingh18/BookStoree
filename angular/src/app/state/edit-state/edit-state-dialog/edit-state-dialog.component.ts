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
  CountryDto,
  StateDto,
  StateServiceProxy,
} from "../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "../../../../shared/app-component-base";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-edit-state-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './edit-state-dialog.component.html',
  styleUrl: './edit-state-dialog.component.css'
})
export class EditStateDialogComponent extends AppComponentBase {
  saving = false;
  state: StateDto = new StateDto();
  @Input() countries: CountryDto[] = [];
  id: number;
  selectedDate: string = "";

  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public _stateService: StateServiceProxy,
    public bsModelRef: BsModalRef,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

  save(): void {
    this.saving = true;

    this._stateService.update(this.state).subscribe(
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
