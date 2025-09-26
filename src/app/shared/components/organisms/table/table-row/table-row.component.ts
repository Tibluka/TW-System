import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-table-row',
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styleUrl: './table-row.component.scss',
  host: {
    '[class.header-row]': 'isHeader',
    '[class.clickable-row]': 'clickable',
    '(click)': 'onRowClick($event)'
  }
})
export class TableRowComponent {
  @Input() isHeader: boolean = false;
  @Input() clickable: boolean = false;
  @Input() data: any = null;

  @Output() rowClick = new EventEmitter<any>();

  constructor(private elementRef: ElementRef) {

    this.elementRef.nativeElement.style.display = 'table-row';
  }

  onRowClick(event: Event) {
    if (this.clickable) {
      this.rowClick.emit(this.data);
    }
  }
}
