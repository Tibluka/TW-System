// developments.component.ts - Atualizado com componente de upload
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";
import { ModalService } from '../../../shared/services/modal/modal.service';

// Importa o componente que vai dentro do modal
import { FileUploadComponent, UploadedFile } from '../../../shared/components/organisms/file-upload/file-upload.component';
import { ClientsComponent } from '../clients/clients.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-developments',
  templateUrl: './developments.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    ClientsComponent,
    FileUploadComponent,
    ButtonComponent
  ],
  styleUrls: ['./developments.component.scss']
})
export class DevelopmentsComponent {
  private modalService = inject(ModalService);

  // Propriedades para upload único
  singleFiles: UploadedFile[] = [];

  // Propriedades para upload múltiplo
  multipleFiles: UploadedFile[] = [];

  // Propriedades do upload antigo (manter para compatibilidade)
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading: boolean = false;
  message: string | null = null;
  error: string | null = null;

  constructor(private http: HttpClient) { }

  // Handlers para o componente de upload único
  onSingleFileChanged(files: UploadedFile[]): void {
    this.singleFiles = files;
    console.log('Arquivos únicos alterados:', files);
  }

  onSingleFileAdded(file: UploadedFile): void {
    console.log('Arquivo único adicionado:', file);
  }

  onSingleFileRemoved(file: UploadedFile): void {
    console.log('Arquivo único removido:', file);
  }

  // Handlers para o componente de upload múltiplo
  onMultipleFilesChanged(files: UploadedFile[]): void {
    this.multipleFiles = files;
    console.log('Arquivos múltiplos alterados:', files);
  }

  onMultipleFileAdded(file: UploadedFile): void {
    console.log('Arquivo múltiplo adicionado:', file);
  }

  onMultipleFileRemoved(file: UploadedFile): void {
    console.log('Arquivo múltiplo removido:', file);
  }

  // Handler para erros de upload
  onUploadError(error: string): void {
    this.error = error;
    console.error('Erro no upload:', error);

    // Limpar a mensagem de erro após 5 segundos
    setTimeout(() => {
      this.error = null;
    }, 5000);
  }

  // Método para fazer upload dos arquivos para o servidor
  async uploadToServer() {
    const allFiles = [...this.singleFiles, ...this.multipleFiles];

    if (allFiles.length === 0) {
      this.error = 'Nenhum arquivo selecionado para upload';
      return;
    }

    this.isUploading = true;
    this.error = null;
    this.message = null;

    // Simular upload para múltiplos arquivos
    const formData = new FormData();

    allFiles.forEach((uploadedFile) => {
      formData.append(`image`, uploadedFile.file);
    });


    const apiUrl = `${environment.apiUrl}/developments/68c376da0306a9ef8241b3e5/image`;

    try {
      const response = await lastValueFrom(this.http.post(apiUrl, formData));
      console.log('Sucesso:', response);
      this.message = `Upload de ${allFiles.length} arquivo(s) realizado com sucesso!`;

      // Limpar arquivos após upload bem-sucedido
      this.singleFiles = [];
      this.multipleFiles = [];
    } catch (error) {
      console.error('Erro:', error);
      this.error = 'Erro ao fazer upload dos arquivos. Tente novamente.';
    } finally {
      this.isUploading = false;
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

  // Métodos antigos de upload (mantidos para compatibilidade)
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
}