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
  GetBookDto,
  BookServiceProxy,
} from "../../../../shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/app-component-base";
import moment from "@node_modules/moment-timezone";

@Component({
  selector: "app-edit-book-dialog",
  standalone: true,
  imports: [SharedModule],
  templateUrl: "./edit-book-dialog.component.html",
  styleUrl: "./edit-book-dialog.component.css",
})
export class EditBookDialogComponent extends AppComponentBase {
  saving = false;
  book: GetBookDto = new GetBookDto();
  // id: number;
  selectedDate: string = "";

  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public _bookServive: BookServiceProxy,
    public bsModelRef: BsModalRef,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit() {
    if (this.book.publishedDate) {
      this.selectedDate = moment(this.book.publishedDate).format("YYYY-MM-DD");
    }
  }

  save(): void {
    this.saving = true;

    this.book.publishedDate = moment(this.selectedDate);

    this._bookServive.update(this.book).subscribe(
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
