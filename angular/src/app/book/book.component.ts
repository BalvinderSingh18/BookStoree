import { BookFormDialogComponent } from './book-form/book-form-dialog/book-form-dialog.component';
import { ChangeDetectorRef, Component, Injector } from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { SharedModule } from "@shared/shared.module";
import { CommonModule } from "@angular/common";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";

class PagedBookRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}
import {
  GetBookDto,
  BookServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { CreateBookDialogComponent } from "./create-book/create-book-dialog/create-book-dialog.component";
import { EditBookDialogComponent } from "./edit-book/edit-book-dialog/edit-book-dialog.component";
@Component({
  selector: "app-book",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./book.component.html",
  styleUrl: "./book.component.css",
  animations: [appModuleAnimation()],
})
export class BookComponent extends PagedListingComponentBase<GetBookDto> {
  books: GetBookDto[] = [];
  isActive: boolean | null;
  keyword = "";
  advancedFiltersVisible = false;

  constructor(
    injector: Injector,
    private _bookService: BookServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  openBookForm(book?: GetBookDto): void {
    const dialog = this._modalService.show(BookFormDialogComponent, {
      class: 'modal-lg',
      initialState: {
        book: book ? Object.assign({}, book) : null
      }
    });
  
    (dialog.content as BookFormDialogComponent).onSave.subscribe(() => {
      this.refresh();
    });
  }

  createBook(): void {
    this.openBookForm();
  }
  
  editBook(book: GetBookDto): void {
    this.openBookForm(book);
  }
  

  // createBook(): void {
  //   const createDialog = this._modalService.show(CreateBookDialogComponent, {
  //     class: "modal-lg",
  //   });
  //   (createDialog.content as CreateBookDialogComponent).onSave.subscribe(() => {
  //     this.refresh();
  //   });
  // }

  // editBook(book: GetBookDto): void {
  //   const editDialog = this._modalService.show(EditBookDialogComponent, {
  //     class: "modal-lg",
  //     initialState: {
  //       book: Object.assign({}, book), // Clone data to prevent 2-way binding issues
  //     },
  //   });

  //   (editDialog.content as EditBookDialogComponent).onSave.subscribe(() => {
  //     this.refresh();
  //   });
  // }

  clearFilters(): void {
    this.keyword = "";
    this.getDataPage(1);
  }

  protected list(
    request: PagedBookRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._bookService //api call
      .getAll(
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.books = result.items;
        this.showPaging(result, pageNumber);
      });
  }

  protected delete(book: GetBookDto): void {
    debugger;
    abp.message.confirm(
      this.l("Delete Warning Message", book.title),
      undefined,
      (result: boolean) => {
        if (result) {
          this._bookService.delete(book.id).subscribe(() => {
            abp.notify.success(this.l("Successfully Deleted"));
            this.refresh();
          });
        }
      }
    );
  }
}
