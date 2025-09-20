import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, TemplateRef, ContentChild } from '@angular/core';
import { TableColumn, TableData } from '../../../../models/table/table';

@Component({
  selector: 'ds-table',
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit, OnChanges {
  // Inputs principais
  @Input() columns: TableColumn[] = [];
  @Input() data: TableData[] = [];
  @Input() emptyMessage: string = 'Nenhum dado encontrado';

  // Inputs para paginação
  @Input() showPagination: boolean = false;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;

  // Inputs para ordenação
  @Input() sortable: boolean = true;
  @Input() sortColumn: string = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  // Template customizado para células
  @ContentChild('customCell') customCellTemplate!: TemplateRef<any>;

  // Outputs
  @Output() sortChanged = new EventEmitter<{ column: string, direction: 'asc' | 'desc' }>();
  @Output() pageChanged = new EventEmitter<number>();
  @Output() rowClick = new EventEmitter<{ row: TableData, index: number }>();

  // Propriedades internas
  paginatedData: TableData[] = [];
  totalPages: number = 1;

  ngOnInit() {
    this.updatePaginatedData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['pageSize'] || changes['currentPage']) {
      this.updatePaginatedData();
    }
  }

  /**
   * Atualiza os dados paginados
   */
  private updatePaginatedData() {
    if (!this.data || this.data.length === 0) {
      this.paginatedData = [];
      this.totalPages = 0;
      return;
    }

    this.totalPages = Math.ceil(this.data.length / this.pageSize);

    if (this.showPagination) {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.paginatedData = this.data.slice(startIndex, endIndex);
    } else {
      this.paginatedData = [...this.data];
    }
  }

  /**
   * Manipula a ordenação das colunas
   */
  onSort(column: TableColumn) {
    if (!column.sortable || !this.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.sortData();
    this.sortChanged.emit({
      column: this.sortColumn,
      direction: this.sortDirection
    });
  }

  /**
   * Ordena os dados
   */
  private sortData() {
    if (!this.sortColumn || !this.data) return;

    this.data.sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];

      // Tratamento para valores nulos/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Comparação
      let comparison = 0;
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    });

    this.updatePaginatedData();
  }

  /**
   * Navega para a página anterior
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
      this.pageChanged.emit(this.currentPage);
    }
  }

  /**
   * Navega para a próxima página
   */
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
      this.pageChanged.emit(this.currentPage);
    }
  }

  /**
   * Formata o valor da célula baseado no tipo
   */
  formatCellValue(value: any, type?: string): string {
    if (value == null) return '-';

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR');
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('pt-BR') : value;
      case 'boolean':
        return value ? 'Sim' : 'Não';
      default:
        return String(value);
    }
  }

  /**
   * Manipula o clique na linha
   */
  onRowClick(row: TableData, index: number) {
    this.rowClick.emit({ row, index });
  }
}