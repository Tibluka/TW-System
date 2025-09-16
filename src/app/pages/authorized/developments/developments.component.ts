// src/app/pages/authorized/developments/developments.component.ts
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-developments',
  templateUrl: './developments.component.html',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule
  ],
  styleUrls: ['./developments.component.scss']
})
export class DevelopmentsComponent {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  message: string | null = null;
  error: string | null = null;

  // ID de um development existente para testar (substitua por um ID real)
  developmentId = '68c376da0306a9ef8241b3e5'; // Coloque um ID real aqui

  constructor(private http: HttpClient) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.error = null;
    this.message = null;

    // Criar preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadImage() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.error = null;
    this.message = null;

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    // Substitua pela sua URL de API
    const apiUrl = `${environment.apiUrl}/developments/${this.developmentId}/image`;

    this.http.post(apiUrl, formData).subscribe({
      next: (response: any) => {
        console.log('Sucesso:', response);
        this.message = 'Upload realizado com sucesso! ✅';
        this.isUploading = false;
        this.clearSelection();
      },
      error: (error) => {
        console.error('Erro:', error);
        this.error = `Erro no upload: ${error.error?.message || error.message}`;
        this.isUploading = false;
      }
    });
  }

  clearSelection() {
    this.selectedFile = null;
    this.previewUrl = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}