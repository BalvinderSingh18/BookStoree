import {
  Component,
  Injector,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import { AppComponentBase } from "../../../../shared/app-component-base";
import {
  BedDto,
  BedServiceProxy,
  CreateBedDto,
  Status,
  Type,
} from "../../../../shared/service-proxies/service-proxies";

@Component({
  selector: "app-bed-form-dialog",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./bed-form-dialog.component.html",
  styleUrl: "./bed-form-dialog.component.css",
})
export class BedFormDialogComponent extends AppComponentBase implements OnInit {
  @Input() bed: BedDto | null = null; // Input from modal caller
  @Output() onSave = new EventEmitter<any>();
  selectedType: Type;
  selectedStatus: Status;
  saving = false;
  isEditMode = false;

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _bedService: BedServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.bed && this.bed.id) {
      // Edit mode
      this.isEditMode = true;
      this.selectedType = this.bed.type;
      this.selectedStatus = this.bed.status;
    } else {
      // Create mode
      this.isEditMode = false;
      this.bed = new CreateBedDto(); // For creation
    }
  }

  save(): void {
    this.saving = true;
    this.bed!.type = this.selectedType;
    this.bed!.status = this.selectedStatus;
    const save$ = this.isEditMode
      ? this._bedService.update(this.bed!)
      : this._bedService.create(this.bed! as CreateBedDto);

    save$
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: () => {
          this.notify.success(this.l("SavedSuccessfully"));
          this.bsModalRef.hide();
          this.onSave.emit();
        },
        error: (err) => {
          this.notify.error(this.l("SaveFailed"));
          console.error("Save failed:", err);
        },
      });
  }
}
