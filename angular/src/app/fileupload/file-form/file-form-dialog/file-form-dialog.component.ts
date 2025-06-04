import {
  Component,
  Injector,
  Input,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import {
  CreateFileUploadDto,
  FileUploadDto,
  FileUploadServiceProxy,
  UpdateFileUploadDto
} from '../../../../shared/service-proxies/service-proxies';
import { AppComponentBase } from '../../../../shared/app-component-base';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-file-form-dialog',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './file-form-dialog.component.html',
  styleUrl: './file-form-dialog.component.css'
})
export class FileFormDialogComponent extends AppComponentBase implements OnInit {
@Input() fileUpload: CreateFileUploadDto | null = null;
  @Output() onSave = new EventEmitter<any>();
 fileContent: string;
  saving = false;
  isEditMode = false;
  selectedFile: File | null = null;

  constructor(
    injector: Injector,
    public bsModalRef: BsModalRef,
    private _fileUploadService: FileUploadServiceProxy
  ) {
    super(injector);
  }

   ngAfterViewInit(): void {
    // Ensures Bootstrap custom-file-label updates properly (if using Bootstrap 4)
    const inputs = document.querySelectorAll('.custom-file-input');
    inputs.forEach((input: any) => {
      input.addEventListener('change', function (e: any) {
        const fileName = e.target.files[0]?.name;
        const label = e.target.nextElementSibling;
        if (label && fileName) {
          label.innerText = fileName;
        }
      });
    });
  }
  ngOnInit(): void {
    if (this.fileUpload && this.fileUpload.id) {
      this.isEditMode = true;
    } else {
      this.isEditMode = false;
      this.fileUpload = new CreateFileUploadDto();
    this.fileUpload.fileName = '';
    this.fileUpload.filePath = '';
    this.fileUpload.fileContent = '';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
      this.fileUpload!.fileName = this.selectedFile.name;
    }
  }

save(): void {
  if (!this.selectedFile) {
    this.notify.warn(this.l('PleaseSelectAFile'));
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = (reader.result as string).split(',')[1];

    this.saving = true;

    if (this.isEditMode && this.fileUpload?.id) {
      // Update logic
      const updateDto = new UpdateFileUploadDto();
      updateDto.id = this.fileUpload.id;
      updateDto.fileName = this.selectedFile!.name;
      updateDto.filePath = base64;
      updateDto.fileContent = base64; // ✅ if your backend expects it

      this._fileUploadService
        .update(updateDto)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: () => {
            this.notify.success(this.l('UpdatedSuccessfully'));
            this.bsModalRef.hide();
            this.onSave.emit();
          },
          error: (err) => {
            this.notify.error(this.l('UpdateFailed'));
            console.error('Update failed:', err);
          }
        });
    } else {
      // Create logic
      const createDto = new CreateFileUploadDto();
      createDto.fileName = this.selectedFile!.name;
      createDto.filePath = base64;
      createDto.fileContent = base64;

      this._fileUploadService
        .uploadFile(createDto)
        .pipe(finalize(() => (this.saving = false)))
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
  };

  reader.onerror = (err) => {
    this.notify.error('Failed to read file.');
    console.error('FileReader error:', err);
  };

  reader.readAsDataURL(this.selectedFile);
}
}
