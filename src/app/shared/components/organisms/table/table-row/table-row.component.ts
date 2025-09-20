import { Component, Input, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-table-row',
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
  `,
  styleUrl: './table-row.component.scss'
})
export class TableRowComponent {
  @Input() isHeader: boolean = false;
  @Input() clickable: boolean = false;
  @Input() data: any = null; // Para passar dados da linha

  @Output() rowClick = new EventEmitter<any>();

  @HostBinding('class.header-row')
  get isHeaderRow() {
    return this.isHeader;
  }

  @HostBinding('class.clickable-row')
  get isClickableRow() {
    return this.clickable;
  }

  @HostListener('click', ['$event'])
  onRowClick(event: Event) {
    if (this.clickable) {
      this.rowClick.emit(this.data);
    }
  }
}