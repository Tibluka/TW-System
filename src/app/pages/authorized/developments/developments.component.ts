// developments.component.ts - Atualizado com componente de upload
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ModalComponent } from "../../../shared/components/organisms/modal/modal.component";
import { ModalService } from '../../../shared/services/modal/modal.service';

// Importa o componente que vai dentro do modal
import { lastValueFrom } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { UploadedFile } from '../../../shared/components/organisms/file-upload/file-upload.component';

@Component({
  selector: 'app-developments',
  templateUrl: './developments.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    ButtonComponent,
    FormsModule
  ],
  providers: [
    NgModel
  ],
  styleUrls: ['./developments.component.scss']
})
export class DevelopmentsComponent {
  private modalService = inject(ModalService);



  constructor(private http: HttpClient) { }


  // Método para abrir o modal com o componente filho
  openModalWithComponent() {
    this.modalService.open({
      id: 'developments-component',
      title: '',
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