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
    if (this.ngModel !== undefined) {
      this.value = this.ngModel;
    }
  }

  ngOnDestroy() { }

  // Implementação do ControlValueAccessor
  writeValue(value: any): void {
    this.value = value || '';
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

  // Método principal para mudanças de valor
  onInputChange(newValue: any): void {
    this.value = newValue.value;

    // Emitir para ControlValueAccessor (FormControl)
    this.onChange(newValue);

    // Emitir para ngModel standalone
    this.ngModelChange.emit(newValue);

    // Emitir evento customizado
    this.valueChanged.emit(newValue);
  }

  onValueChanged(unmaskedValue: any): void {
    // Evento da mask-directive quando dropSpecialCharacters é true
    if (this.dropSpecialCharacters && this.mask) {
      this.onInputChange(unmaskedValue);
    }
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