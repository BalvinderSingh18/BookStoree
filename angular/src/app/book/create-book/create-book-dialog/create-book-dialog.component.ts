import { Component, Injector } from "@angular/core";
import { finalize } from "rxjs/operators";
import { EventEmitter, Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import {
  CreateBookDto,
  BookServiceProxy,
} from "../../../../shared/service-proxies/service-proxies";
import { SharedModule } from "@shared/shared.module";
import moment from "@node_modules/moment-timezone";
import { AppComponentBase } from "@shared/app-component-base";

@Component({
  selector: "app-create-book-dialog",
  standalone: true,
  imports: [SharedModule],
  templateUrl: "./create-book-dialog.component.html",
  styleUrl: "./create-book-dialog.component.css",
})
export class CreateBookDialogComponent extends AppComponentBase {
  saving = false;
  book = new CreateBookDto();
  @Output() onSave = new EventEmitter<any>();
  // selectedDate = new Date();
  // selectedDate: string = new Date().toISOString().split('T')[0]; // → "2025-04-30"
  selectedDate: string = "";
  constructor(
    injector: Injector,
    public bsModelRef: BsModalRef,
    private _bookService: BookServiceProxy
  ) {
    super(injector);
  }
  ngOnInit() {
    this.book.publishedDate = moment(this.selectedDate);
  }
  save(): void {
    this.saving = true;

    if (!this.selectedDate) {
      this.selectedDate = new Date().toISOString().split("T")[0];
    }

    this.book.publishedDate = moment(this.selectedDate);

    this._bookService
      .create(this.book)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.notify.info(this.l("Saved Successfully"));
          this.bsModelRef.hide();
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
