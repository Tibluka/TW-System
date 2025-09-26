import { NgIf, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ds-spinner',
  imports: [NgStyle],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {

  @Input() variant: 'fill' | 'outline' | 'ghost' = 'fill';
  @Input() size: string = '24px';

  get color() {
    switch (this.variant) {
      case 'fill':
        return 'white';
      case 'outline':
        return 'tertiary'
      default:
        return 'tertiary'
    }
  }
}
