import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ds-input',
  imports: [CommonModule, IconComponent],
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
  @Input() icon: string = ''; // Ícone opcional
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() maxlength: number | null = null;
  @Input() minlength: number | null = null;
  @Input() readonly: boolean = false;
  @Input() autocomplete: string = 'off';
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';
  @Input() fullWidth: boolean = false;
  @Input() width: string = 'fit-content';

  // Propriedades internas
  value: string = '';
  isFocused: boolean = false;
  uniqueId: string = '';

  // Callbacks do ControlValueAccessor
  private onChange = (value: string) => { };
  private onTouched = () => { };

  ngOnInit() {
    // Gerar ID único para o input
    this.uniqueId = `ds-input-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnDestroy() {
    // Cleanup se necessário
  }

  // Implementação do ControlValueAccessor
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Métodos de evento
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onInputFocus(): void {
    this.isFocused = true;
  }

  onInputBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  // Getters para classes CSS dinâmicas
  get inputClasses(): string {
    const classes = ['input-field'];

    if (this.invalid) {
      classes.push('invalid');
    }

    if (this.disabled) {
      classes.push('disabled');
    }

    if (this.readonly) {
      classes.push('readonly');
    }

    if (this.icon) {
      classes.push(`has-icon-${this.iconPosition}`);
    }

    return classes.join(' ');
  }

  get labelClasses(): string {
    const classes = [];

    if (this.required) {
      classes.push('required');
    }

    return classes.join(' ');
  }

  get showError(): boolean {
    return this.invalid && !!this.errorMessage;
  }

  get showHelper(): boolean {
    return !this.showError && !!this.helperText;
  }
}