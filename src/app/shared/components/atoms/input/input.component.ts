// input.component.ts - CORREÇÃO SIMPLES QUE MANTÉM NGMODEL FUNCIONANDO
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaskDirective } from 'mask-directive';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ds-input',
  imports: [CommonModule, IconComponent, MaskDirective, FormsModule],
  standalone: true,
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() invalid: boolean = false;
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() maxlength: number | null = null;
  @Input() minlength: number | null = null;
  @Input() readonly: boolean = false;
  @Input() autocomplete: string = 'off';
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';
  @Input() fullWidth: boolean = false;
  @Input() width: string = 'fit-content';

  // Propriedades da máscara
  @Input() mask: string = '';
  @Input() dropSpecialCharacters: boolean = false;

  // Para ngModel standalone
  @Input() ngModel: any;
  @Output() ngModelChange = new EventEmitter<any>();

  // Outros eventos
  @Output() valueChanged = new EventEmitter<string>();

  // Propriedades internas
  value: string = '';
  isFocused: boolean = false;
  uniqueId: string = '';

  // Callbacks do ControlValueAccessor
  private onChange = (value: any) => { };
  private onTouched = () => { };

  ngOnInit() {
    this.uniqueId = `ds-input-${Math.random().toString(36).substr(2, 9)}`;

    // Se ngModel foi passado, inicializar value
    if (this.ngModel !== undefined && this.ngModel !== null) {
      this.value = String(this.ngModel);
    }
  }

  ngOnDestroy() { }

  // Implementação do ControlValueAccessor
  writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.value = '';
    } else {
      this.value = String(value);
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // MANTÉM O MÉTODO ORIGINAL
  onInputChange(target: any): void {
    if (!target) return;

    const newValue = target.value || '';
    this.value = newValue;

    // Para formulários reativos
    this.onChange(newValue);

    // Para ngModel standalone  
    this.ngModelChange.emit(newValue);

    // Evento customizado
    this.valueChanged.emit(newValue);
  }

  // NOVO: Tratamento específico da máscara
  onMaskValueChange(unmaskedValue: any): void {
    // Só processa se dropSpecialCharacters estiver ativo
    if (this.dropSpecialCharacters && this.mask) {
      const cleanValue = unmaskedValue !== null && unmaskedValue !== undefined
        ? String(unmaskedValue)
        : '';

      console.log('🎯 Valor sem máscara:', cleanValue);

      // Atualizar o valor interno
      this.value = cleanValue;

      // Notificar todos os sistemas com valor limpo
      this.onChange(cleanValue);
      this.ngModelChange.emit(cleanValue);
      this.valueChanged.emit(cleanValue);
    }
    // Se dropSpecialCharacters for false, deixa o onInputChange tratar normalmente
  }

  onInputFocus(): void {
    this.isFocused = true;
  }

  onInputBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  // Getters
  get inputClasses(): string {
    const classes = ['input-field'];

    if (this.invalid) classes.push('invalid');
    if (this.disabled) classes.push('disabled');
    if (this.readonly) classes.push('readonly');
    if (this.icon) classes.push(`has-icon-${this.iconPosition}`);

    return classes.join(' ');
  }

  get labelClasses(): string {
    const classes = [];
    if (this.required) classes.push('required');
    return classes.join(' ');
  }

  get showError(): boolean {
    return this.invalid && !!this.errorMessage;
  }

  get showHelper(): boolean {
    return !this.showError && !!this.helperText;
  }

  get hasMask(): boolean {
    return !!this.mask;
  }
}