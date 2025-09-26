
import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { CardComponent } from '../../organisms/card/card.component';
import { IconComponent } from '../../atoms/icon/icon.component';

export type ViewMode = 'table' | 'cards';

export interface ListViewConfig {
  showToggle?: boolean;
  defaultView?: ViewMode;
  cardConfig?: {
    columns?: number;
    minWidth?: string;
    gap?: string;
  };
  storageKey?: string; // Para persistir preferência
}

@Component({
  selector: 'ds-list-view',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, CardComponent, IconComponent],
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class DsListViewComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() config: ListViewConfig = {};
  @Input() pagination?: any;
  @Input() showPagination: boolean = true;
  @Input() showActions: boolean = true;
  @Input() emptyMessage: string = 'Nenhum item encontrado';
  @Input() loading: boolean = false;
  @Input() trackByFn: (index: number, item: any) => any = (index, item) => item.id || item._id || index;

  @Output() itemClick = new EventEmitter<any>();
  @Output() viewModeChange = new EventEmitter<ViewMode>();


  @ContentChild('cardTemplate', { static: false }) cardTemplate!: TemplateRef<any>;
  @ContentChild('actionsTemplate', { static: false }) actionsTemplate!: TemplateRef<any>;

  currentViewMode: ViewMode = 'table';

  get hasItems(): boolean {
    return this.items && this.items.length > 0;
  }

  get isEmpty(): boolean {
    return !this.loading && (!this.items || this.items.length === 0);
  }

  ngOnInit() {

    this.currentViewMode = this.config.defaultView || 'table';


    if (this.config.storageKey) {
      const saved = localStorage.getItem(this.config.storageKey) as ViewMode;
      if (saved) {
        this.currentViewMode = saved;
      }
    }
  }

  setViewMode(mode: ViewMode) {
    this.currentViewMode = mode;
    this.viewModeChange.emit(mode);


    if (this.config.storageKey) {
      localStorage.setItem(this.config.storageKey, mode);
    }
  }

  onItemClick(item: any) {
    this.itemClick.emit(item);
  }

  getGridStyles(): string {
    const cardConfig = this.config.cardConfig || {};
    const minWidth = cardConfig.minWidth || '320px';
    const gap = cardConfig.gap || '24px';

    if (cardConfig.columns) {
      return `
        display: grid;
        grid-template-columns: repeat(${cardConfig.columns}, 1fr);
        gap: ${gap};
      `;
    }

    return `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${minWidth}, 1fr));
      gap: ${gap};
    `;
  }

  getAnimationDelay(index: number): string {
    return `${index * 50}ms`;
  }
}
