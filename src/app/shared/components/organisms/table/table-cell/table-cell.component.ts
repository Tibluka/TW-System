import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-table-cell',
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
  `,
  styleUrl: './table-cell.component.scss'
})
export class TableCellComponent {
  @Input() align: 'left' | 'center' | 'right' = 'left';
  @Input() width: string = '';
  @Input() isHeader: boolean = false;

  @HostBinding('style.text-align')
  get textAlign() {
    return this.align;
  }

  @HostBinding('style.width')
  get cellWidth() {
    return this.width || 'auto';
  }

  @HostBinding('class.header-cell')
  get isHeaderCell() {
    return this.isHeader;
  }
}
