import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-checkbox',
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = '';
  @Input() helperText: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() invalid: boolean = false;
  @Input() errorMessage: string = '';

  value: boolean = false;
  onChange = (value: boolean) => { };
  onTouched = () => { };

  ngOnInit(): void { }

  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.checked;
    this.onChange(this.value);
    this.onTouched();
  }

  get showError(): boolean {
    return this.invalid && !!this.errorMessage;
  }

  get showHelper(): boolean {
    return !this.showError && !!this.helperText;
  }
}
