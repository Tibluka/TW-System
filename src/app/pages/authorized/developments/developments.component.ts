// developments.component.ts - Atualizado com seu contexto atual
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ModalService } from '../../../shared/services/modal/modal.service';
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";

// Importa o componente que vai dentro do modal
import { ClientsComponent } from '../clients/clients.component';

@Component({
  selector: 'app-developments',
  templateUrl: './developments.component.html',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    ModalComponent,
    ClientsComponent  // ← Importa o componente filho
  ],
  styleUrls: ['./developments.component.scss']
})
export class DevelopmentsComponent {
  private modalService = inject(ModalService);

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(private http: HttpClient) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.error = null;
    this.message = null;

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

    const apiUrl = `${environment.apiUrl}/developments/68c376da0306a9ef8241b3e5/image`;

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

  // Método para abrir o modal com o componente filho
  openModalWithComponent() {
    this.modalService.open({
      id: 'clients-component',
      title: 'Gerenciar Clientes',
      size: 'lg', // Modal maior para acomodar a lista de clientes
      showHeader: true,
      showCloseButton: true,
      closeOnBackdropClick: false, // Desabilita fechar clicando fora
      closeOnEscapeKey: false      // Desabilita fechar com ESC
    }).subscribe(result => {
      console.log('Modal fechado pelo componente filho:', result);

      if (result?.action === 'saved') {
        this.message = `Cliente salvo com sucesso!`;
      } else if (result?.action === 'canceled') {
        console.log('Operação cancelada');
      } else if (result?.action === 'selected') {
        this.message = `Cliente selecionado: ${result.data?.name || 'Cliente'}`;
      }
    });
  }

  // Handlers para os eventos do componente filho
  onClientAction(data: any) {
    console.log('Ação do cliente recebida:', data);
    // Aqui você pode processar as ações do componente de clientes
  }
}