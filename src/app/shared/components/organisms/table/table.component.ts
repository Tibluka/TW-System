import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { TableCellComponent } from './table-cell/table-cell.component';
import { TableRowComponent } from './table-row/table-row.component';

@Component({
  selector: 'ds-table',
  imports: [CommonModule, TableCellComponent, TableRowComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements AfterContentInit {
  // Inputs opcionais para modo compatível
  @Input() showPagination: boolean = false;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() emptyMessage: string = 'Nenhum dado encontrado';

  // Outputs
  @Output() pageChanged = new EventEmitter<number>();

  // ContentChildren para detectar rows
  @ContentChildren(TableRowComponent) rows!: QueryList<TableRowComponent>;

  // Propriedades internas para paginação
  totalPages: number = 1;

  ngAfterContentInit() {
    this.updatePagination();
  }

  private updatePagination() {
    if (this.showPagination && this.rows) {
      // Filtra apenas as rows que não são header
      const dataRows = this.rows.filter(row => !row.isHeader);
      this.totalPages = Math.ceil(dataRows.length / this.pageSize);
    }
  }

  /**
   * Navega para a página anterior
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChanged.emit(this.currentPage);
    }
  }

  /**
   * Navega para a próxima página
   */
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageChanged.emit(this.currentPage);
    }
  }
}