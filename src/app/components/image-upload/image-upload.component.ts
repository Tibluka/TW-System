// src/app/components/image-upload/image-upload.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ImageUploadService, ImageData, ImageUploadProgress } from '../../services/image-upload/image-upload.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit, OnDestroy {
  @Input() developmentId!: string;
  @Input() currentImage?: ImageData | null;
  @Input() readonly = false;
  @Output() imageUploaded = new EventEmitter<ImageData>();
  @Output() imageRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadProgress: ImageUploadProgress | null = null;
  isUploading = false;
  error: string | null = null;

  private progressSubscription?: Subscription;

  constructor(private imageUploadService: ImageUploadService) { }

  ngOnInit() {
    this.progressSubscription = this.imageUploadService.getUploadProgress()
      .subscribe(progress => {
        this.uploadProgress = progress;
        this.isUploading = progress?.status === 'uploading';

        if (progress?.status === 'error') {
          this.error = 'Erro no upload da imagem';
        }
      });
  }

  ngOnDestroy() {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar arquivo
    const validation = this.imageUploadService.validateImageFile(file);
    if (!validation.valid) {
      this.error = validation.error!;
      return;
    }

    this.error = null;
    this.selectedFile = file;

    // Criar preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadImage() {
    if (!this.selectedFile || !this.developmentId) return;

    this.error = null;
    this.imageUploadService.resetProgress();

    this.imageUploadService.uploadDevelopmentImage(this.developmentId, this.selectedFile)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.currentImage = response.data.development.pieceImage;
            this.imageUploaded.emit(this.currentImage);
            this.clearSelection();
          }
        },
        error: (error) => {
          console.error('Erro no upload:', error);
          this.error = error.error?.message || 'Erro ao fazer upload da imagem';
          this.isUploading = false;
        }
      });
  }

  removeImage() {
    if (!this.developmentId || !this.currentImage) return;

    if (confirm('Tem certeza que deseja remover esta imagem?')) {
      this.imageUploadService.removeDevelopmentImage(this.developmentId)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.currentImage = null;
              this.imageRemoved.emit();
            }
          },
          error: (error) => {
            console.error('Erro ao remover imagem:', error);
            this.error = error.error?.message || 'Erro ao remover imagem';
          }
        });
    }
  }

  clearSelection() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = null;
  }

  // Obter URL otimizada da imagem
  getImageUrl(size: 'original' | 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string | null {
    if (!this.currentImage?.optimizedUrls) {
      return this.currentImage?.url || null;
    }
    return this.currentImage.optimizedUrls[size] || this.currentImage.url;
  }
}