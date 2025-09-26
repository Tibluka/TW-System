import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';
import { PieceImage } from '../../../../models/developments/developments';

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

@Component({
  selector: 'ds-file-upload',
  imports: [CommonModule, IconComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnChanges {

  @Input() label: string = '';
  @Input() placeholder: string = 'Clique para selecionar ou arraste arquivos aqui';
  @Input() helperText: string = 'Apenas imagens (JPG, JPEG, PNG) são aceitas';
  @Input() multiple: boolean = false;
  @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB em bytes
  @Input() acceptedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png'];
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() width: string = 'fit-content';
  @Input() existingFile: PieceImage | undefined;

  @Output() filesChanged = new EventEmitter<UploadedFile[]>();
  @Output() fileAdded = new EventEmitter<UploadedFile>();
  @Output() fileRemoved = new EventEmitter<UploadedFile>();
  @Output() uploadError = new EventEmitter<string>();

  uploadedFiles: UploadedFile[] = [];
  isDragOver = false;
  isProcessing = false;


  readonly inputId: string = this.generateId();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingFile'] && changes['existingFile'].currentValue) {
      const file = changes['existingFile'].currentValue as PieceImage;
      const existingFile: UploadedFile = {
        id: '',
        file: undefined as any, // Não há File real, apenas referência
        previewUrl: file.url || '',
        name: file.filename || '',
        size: 0
      };
      this.uploadedFiles = [existingFile];
    }
  }

  get labelClasses(): string {
    return this.required ? 'required' : '';
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (this.disabled) return;

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  private handleFiles(files: File[]): void {
    if (this.disabled) return;

    this.isProcessing = true;
    const validFiles: File[] = [];


    for (const file of files) {

      if (!this.acceptedTypes.includes(file.type)) {
        this.uploadError.emit(`Tipo de arquivo não aceito: ${file.name}`);
        continue;
      }


      if (file.size > this.maxFileSize) {
        this.uploadError.emit(`Arquivo muito grande: ${file.name}. Máximo ${this.formatFileSize(this.maxFileSize)}`);
        continue;
      }


      if (!this.multiple && this.uploadedFiles.length > 0) {
        this.clearAllFiles();
      }


      if (!this.multiple && validFiles.length > 0) {
        break;
      }

      validFiles.push(file);
    }


    this.processValidFiles(validFiles);
  }

  private async processValidFiles(files: File[]): Promise<void> {
    for (const file of files) {
      try {
        const previewUrl = await this.createPreviewUrl(file);
        const uploadedFile: UploadedFile = {
          id: this.generateId(),
          file,
          previewUrl,
          name: file.name,
          size: file.size
        };

        this.uploadedFiles.push(uploadedFile);
        this.fileAdded.emit(uploadedFile);
      } catch (error) {
        this.uploadError.emit(`Erro ao processar arquivo: ${file.name}`);
      }
    }

    this.isProcessing = false;
    this.filesChanged.emit([...this.uploadedFiles]);
  }

  private createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  removeFile(fileToRemove: UploadedFile): void {
    if (this.disabled) return;


    URL.revokeObjectURL(fileToRemove.previewUrl);


    this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== fileToRemove.id);

    this.fileRemoved.emit(fileToRemove);
    this.filesChanged.emit([...this.uploadedFiles]);
  }

  clearAllFiles(): void {
    if (this.disabled) return;


    this.uploadedFiles.forEach(file => {
      URL.revokeObjectURL(file.previewUrl);
    });

    this.uploadedFiles = [];
    this.filesChanged.emit([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  triggerFileInput(): void {
    if (this.disabled) return;
    const fileInput = document.getElementById(this.inputId) as HTMLInputElement;
    fileInput?.click();
  }
}
