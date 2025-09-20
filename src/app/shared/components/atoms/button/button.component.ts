import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';
@Component({
  selector: 'ds-button',
  imports: [NgStyle, NgClass, SpinnerComponent, NgIf],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() label: string = '';
  @Input() variant: 'fill' | 'outline' | 'ghost' = 'fill';
  @Input() icon: string = '';
  @Input() iconSize: string = '';
  @Input() fullWidth: boolean = false;
  @Input() rounded: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;

  @Output() onClickEmitter = new EventEmitter();

  emitAction() {
    this.onClickEmitter.emit();
  }
}
