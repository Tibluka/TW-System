import { NgClass, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'ds-button',
  imports: [NgStyle, NgClass],
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

  @Output() onClickEmitter = new EventEmitter();

  emitAction() {
    this.onClickEmitter.emit();
  }
}
