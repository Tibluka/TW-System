import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ds-textarea',
  imports: [CommonModule, IconComponent],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ]
})
export class TextareaComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() invalid: boolean = false;
  @Input() icon: string = ''; // Ícone opcional
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() maxlength: number | null = null;
  @Input() minlength: number | null = null;
  @Input() readonly: boolean = false;
  @Input() rows: number = 4; // Número de linhas visíveis
  @Input() cols: number | null = null; // Número de colunas
  @Input() resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical'; // Controle de redimensionamento
  @Input() autocomplete: string = 'off';
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';
  @Input() fullWidth: boolean = false;
  @Input() width: string = 'fit-content';


  value: string = '';
  isFocused: boolean = false;
  uniqueId: string = '';


  private onChange = (value: string) => { };
  private onTouched = () => { };

  ngOnInit() {

    this.uniqueId = `ds-textarea-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnDestroy() {

  }


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


  onTextareaChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onTextareaFocus(): void {
    this.isFocused = true;
  }

  onTextareaBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }


  onTextareaInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);


    if (this.resize === 'none' || this.resize === 'horizontal') {
      this.autoResize(target);
    }
  }

  private autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }


  get textareaClasses(): string {
    const classes = ['textarea-field'];

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

    classes.push(`resize-${this.resize}`);

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

  get characterCount(): number {
    return this.value ? this.value.length : 0;
  }

  get showCharacterCount(): boolean {
    return !!this.maxlength;
  }
}
