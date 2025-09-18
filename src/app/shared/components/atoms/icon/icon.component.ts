import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [NgStyle],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {

  @Input() icon: string = '';
  @Input() fontSize: string = '';
  @Input() cursorType: string = '';
  @Input() color: string = '';

}
