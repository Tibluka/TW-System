import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { InputComponent } from '../../../shared/components/atoms/input/input.component';
import { FormValidator } from '../../../shared/utils/form';
import { TextareaComponent } from '../../../shared/components/atoms/textarea/textarea.component';
import { CardComponent } from '../../../shared/components/organisms/card/card.component';

@Component({
  selector: 'app-clients',
  imports: [
    CommonModule,
    ButtonComponent,
    ReactiveFormsModule,
    InputComponent,
    TextareaComponent,
    CardComponent
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent extends FormValidator {

  clientForm = new FormGroup({
    name: new FormControl('', Validators.required),
    notes: new FormControl('', Validators.required)
  });

  click() {
    alert('Sucesso!')
  }

  submit() {
    this.clientForm.markAllAsTouched();
  }

}
