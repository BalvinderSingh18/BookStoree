import { Component, Injector, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { AppComponentBase } from '../../../../shared/app-component-base';
import { BookServiceProxy, CreateBookDto, GetBookDto } from '../../../../shared/service-proxies/service-proxies';

@Component({
  selector: 'app-book-form-dialog',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './book-form-dialog.component.html',
  styleUrl: './book-form-dialog.component.css'
})
export class BookFormDialogComponent extends AppComponentBase implements OnInit {
  @Input() book: GetBookDto | null = null; // Input from modal caller
  @Output() onSave = new EventEmitter<any>();

  saving = false;
  selectedDate: string = '';
  isEditMode = false;

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _bookService: BookServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.book && this.book.id) {
      // Edit mode
      this.isEditMode = true;
      this.selectedDate = moment(this.book.publishedDate).format('YYYY-MM-DD');
    } else {
      // Create mode
      this.isEditMode = false;
      this.book = new CreateBookDto(); // For creation
    }
  }

  save(): void {
    this.saving = true;

    const formattedDate = moment(this.selectedDate);
    this.book!.publishedDate = formattedDate;

    const save$ = this.isEditMode
      ? this._bookService.update(this.book!)
      : this._bookService.create(this.book! as CreateBookDto);

    save$
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: () => {
          this.notify.success(this.l('SavedSuccessfully'));
          this.bsModalRef.hide();
          this.onSave.emit();
        },
        error: (err) => {
          this.notify.error(this.l('SaveFailed'));
          console.error('Save failed:', err);
        }
      });
  }
}
