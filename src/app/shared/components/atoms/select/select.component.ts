import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
  [key: string]: any;
}

@Component({
  selector: 'ds-select',
  imports: [CommonModule, IconComponent, FormsModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Selecione uma opção';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() invalid: boolean = false;
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() readonly: boolean = false;
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';
  @Input() fullWidth: boolean = false;
  @Input() width: string = 'fit-content';
  @Input() multiple: boolean = false;
  @Input() searchable: boolean = false;
  @Input() clearable: boolean = false;
  @Input() options: SelectOption[] = [];
  @Input() optionValue: string = 'value';
  @Input() optionLabel: string = 'label';
  @Input() loadingText: string = 'Carregando...';
  @Input() noOptionsText: string = 'Nenhuma opção encontrada';
  @Input() loading: boolean = false;
  @Input() placement: 'top' | 'bottom' = 'bottom';

  // Eventos
  @Output() selectionChanged = new EventEmitter<any>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() searched = new EventEmitter<string>();

  // Propriedades internas
  value: any = null;
  selectedOptions: SelectOption[] = [];
  isOpen: boolean = false;
  isFocused: boolean = false;
  uniqueId: string = '';
  searchTerm: string = '';
  filteredOptions: SelectOption[] = [];

  // Callbacks do ControlValueAccessor
  private onChange = (value: any) => { };
  public onTouched = () => { };

  ngOnInit() {
    this.uniqueId = `ds-select-${Math.random().toString(36).substr(2, 9)}`;
    this.updateFilteredOptions();
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  // Implementação do ControlValueAccessor
  writeValue(value: any): void {
    this.value = value;
    this.updateSelectedOptions();
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

  // Métodos do componente
  toggleDropdown(): void {
    if (this.disabled || this.readonly) return;

    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.disabled || this.readonly) return;

    this.isOpen = true;
    this.isFocused = true;
    this.opened.emit();

    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick.bind(this));
    });
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.isFocused = false;
    this.searchTerm = '';
    this.updateFilteredOptions();
    this.closed.emit();

    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    const selectElement = document.getElementById(this.uniqueId + '-container');

    if (selectElement && !selectElement.contains(target)) {
      this.closeDropdown();
      this.onTouched();
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    if (this.multiple) {
      this.handleMultipleSelection(option);
    } else {
      this.handleSingleSelection(option);
    }

    this.selectionChanged.emit(this.value);
  }

  private handleSingleSelection(option: SelectOption): void {
    this.value = option[this.optionValue];
    this.selectedOptions = [option];
    this.onChange(this.value);
    this.closeDropdown();
  }

  private handleMultipleSelection(option: SelectOption): void {
    const optionValue = option[this.optionValue];
    const currentValues = Array.isArray(this.value) ? [...this.value] : [];

    const index = currentValues.indexOf(optionValue);

    if (index > -1) {
      currentValues.splice(index, 1);
      this.selectedOptions = this.selectedOptions.filter(o =>
        o[this.optionValue] !== optionValue
      );
    } else {
      currentValues.push(optionValue);
      this.selectedOptions.push(option);
    }

    this.value = currentValues;
    this.onChange(this.value);
  }

  removeOption(option: SelectOption, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.multiple) {
      const optionValue = option[this.optionValue];
      this.value = this.value.filter((v: any) => v !== optionValue);
      this.selectedOptions = this.selectedOptions.filter(o =>
        o[this.optionValue] !== optionValue
      );
      this.onChange(this.value);
      this.selectionChanged.emit(this.value);
    }
  }

  clearSelection(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.value = this.multiple ? [] : null;
    this.selectedOptions = [];
    this.onChange(this.value);
    this.selectionChanged.emit(this.value);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.updateFilteredOptions();
    this.searched.emit(this.searchTerm);
  }

  private updateFilteredOptions(): void {
    if (!this.searchTerm) {
      this.filteredOptions = [...this.options];
      return;
    }

    this.filteredOptions = this.options.filter(option => {
      const label = option[this.optionLabel]?.toString().toLowerCase();
      return label?.includes(this.searchTerm.toLowerCase());
    });
  }

  private updateSelectedOptions(): void {
    if (this.multiple && Array.isArray(this.value)) {
      this.selectedOptions = this.options.filter(option =>
        this.value.includes(option[this.optionValue])
      );
    } else if (!this.multiple && this.value !== null && this.value !== undefined) {
      const selectedOption = this.options.find(option =>
        option[this.optionValue] === this.value
      );
      this.selectedOptions = selectedOption ? [selectedOption] : [];
    } else {
      this.selectedOptions = [];
    }
    this.updateFilteredOptions();
  }

  isOptionSelected(option: SelectOption): boolean {
    if (this.multiple) {
      return Array.isArray(this.value) &&
        this.value.includes(option[this.optionValue]);
    }
    return this.value === option[this.optionValue];
  }

  // Getters para classes CSS dinâmicas
  get selectClasses(): string {
    const classes = ['select-field'];

    if (this.invalid) classes.push('invalid');
    if (this.disabled) classes.push('disabled');
    if (this.readonly) classes.push('readonly');
    if (this.isOpen) classes.push('open');
    if (this.isFocused) classes.push('focused');
    if (this.icon) classes.push(`has-icon-${this.iconPosition}`);

    return classes.join(' ');
  }

  get labelClasses(): string {
    const classes = ['select-label'];
    if (this.required) classes.push('required');
    return classes.join(' ');
  }

  get dropdownClasses(): string {
    const classes = ['select-dropdown'];
    classes.push(`placement-${this.placement}`);
    return classes.join(' ');
  }

  get displayValue(): string {
    if (this.multiple) {
      return this.selectedOptions.length > 0
        ? `${this.selectedOptions.length} selecionado(s)`
        : this.placeholder;
    }

    return this.selectedOptions.length > 0
      ? this.selectedOptions[0][this.optionLabel]?.toString() || ''
      : this.placeholder;
  }

  get showError(): boolean {
    return this.invalid && !!this.errorMessage;
  }

  get showHelper(): boolean {
    return !this.showError && !!this.helperText;
  }

  get hasValue(): boolean {
    if (this.multiple) {
      return Array.isArray(this.value) && this.value.length > 0;
    }
    return this.value !== null && this.value !== undefined && this.value !== '';
  }
}