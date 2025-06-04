import { Component, Injector, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import {
  PagedListingComponentBase,
  PagedRequestDto
} from 'shared/paged-listing-component-base';
import {
  FileUploadDto,
  FileUploadServiceProxy
} from '@shared/service-proxies/service-proxies';
import { FileFormDialogComponent } from 'app/fileupload/file-form/file-form-dialog/file-form-dialog.component';

class PagedFileUploadRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-fileupload',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './fileupload.component.html',
  styleUrl: './fileupload.component.css',
  animations: [appModuleAnimation()],
})
export class FileuploadComponent extends PagedListingComponentBase<FileUploadDto> {
  fileUploads: FileUploadDto[] = [];
  isActive: boolean | null;
  keyword = '';
  sorting = 'name asc';
  advancedFiltersVisible = false;

  constructor(
    injector: Injector,
    private _fileUploadService: FileUploadServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  openFileForm(fileUpload?: FileUploadDto): void {
    const dialog = this._modalService.show(FileFormDialogComponent, {
      class: 'modal-lg',
      initialState: {
        fileUpload: fileUpload ? Object.assign({}, fileUpload) : null,
      },
    });

    (dialog.content as FileFormDialogComponent).onSave.subscribe(() => {
      this.refresh();
    });
  }

  createFile(): void {
    this.openFileForm();
  }

  editFile(fileupload: FileUploadDto): void {
    this.openFileForm(fileupload);
  }

  clearFilters(): void {
    this.keyword = '';
    this.getDataPage(1);
  }

  protected list(
    request: PagedFileUploadRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    request.keyword = this.keyword;

    this._fileUploadService
      .getAll(
        request.keyword,
        this.sorting,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(finalize(() => finishedCallback()))
      .subscribe((result: any) => {
        this.fileUploads = result.items;
        this.showPaging(result, pageNumber);
      });
  }

  protected delete(fileupload: FileUploadDto): void {
    abp.message.confirm(
      this.l('Delete Warning Message', fileupload.fileName),
      undefined,
      (result: boolean) => {
        if (result) {
          this._fileUploadService.delete(fileupload.id).subscribe(() => {
            abp.notify.success(this.l('Successfully Deleted'));
            this.refresh();
          });
        }
      }
    );
  }

  downloadFile(file: FileUploadDto): void {
    this._fileUploadService.download(file.fileName).subscribe((response: any) => {
      const blob = new Blob([response], { type: response.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
