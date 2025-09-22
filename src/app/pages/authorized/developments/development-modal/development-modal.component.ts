import { Component } from '@angular/core';

@Component({
  selector: 'app-development-modal',
  imports: [],
  templateUrl: './development-modal.component.html',
  styleUrl: './development-modal.component.scss'
})
export class DevelopmentModalComponent {
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
