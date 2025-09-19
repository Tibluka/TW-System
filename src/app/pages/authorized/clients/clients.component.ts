import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { ɵInternalFormsSharedModule } from "@angular/forms";

@Component({
  selector: 'app-clients',
  imports: [
    CommonModule,
    ButtonComponent,
    ɵInternalFormsSharedModule
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent {


  click() {
    alert('Sucesso!')
  }

}
