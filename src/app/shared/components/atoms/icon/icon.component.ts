import { NgClass, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ds-icon',
  imports: [NgStyle, NgClass],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {

  @Input() icon: string = '';
  @Input() fontSize: string = '';
  @Input() cursorType: string = '';
  @Input() color: string = '';

}
