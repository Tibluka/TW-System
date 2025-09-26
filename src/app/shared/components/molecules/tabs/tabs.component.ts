import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  TrackByFunction
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

export type TabSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent implements AfterViewInit, OnChanges {


  @Input() tabs: TabConfig[] = [];
  @Input() activeTabId: string = '';
  @Input() size: TabSize = 'medium';
  @Input() vertical: boolean = false;
  @Input() scrollable: boolean = false;
  @Input() noPadding: boolean = false;
  @Input() compactPadding: boolean = false;


  @Output() tabChange = new EventEmitter<string>();
  @Output() tabClick = new EventEmitter<{ tabId: string, tab: TabConfig }>();


  @ViewChild('tabsNav', { static: false }) tabsNav!: ElementRef<HTMLDivElement>;


  indicatorTransform = 'translateX(0) scaleX(0)';


  get containerClasses(): string[] {
    const classes = ['ds-tabs-container'];

    if (this.size !== 'medium') {
      classes.push(`size-${this.size}`);
    }

    if (this.vertical) {
      classes.push('vertical');
    }

    return classes;
  }

  get headerClasses(): string[] {
    const classes = ['ds-tabs-header'];

    if (this.scrollable) {
      classes.push('scrollable');
    }

    return classes;
  }

  get contentClasses(): string[] {
    const classes = ['ds-tabs-content'];

    if (this.noPadding) {
      classes.push('no-padding');
    } else if (this.compactPadding) {
      classes.push('compact-padding');
    }

    return classes;
  }

  get activeTab(): TabConfig | undefined {
    return this.tabs.find(tab => tab.id === this.activeTabId);
  }


  ngAfterViewInit(): void {

    setTimeout(() => {
      this.updateIndicator();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTabId'] || changes['tabs']) {

      if (!this.activeTabId && this.tabs.length > 0) {
        const firstEnabledTab = this.tabs.find(tab => !tab.disabled);
        if (firstEnabledTab) {
          this.activeTabId = firstEnabledTab.id;
        }
      }


      setTimeout(() => {
        this.updateIndicator();
      }, 0);
    }
  }


  selectTab(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);

    if (!tab || tab.disabled) {
      return;
    }

    const previousTabId = this.activeTabId;
    this.activeTabId = tabId;


    this.tabClick.emit({ tabId, tab });

    if (previousTabId !== tabId) {
      this.tabChange.emit(tabId);
    }


    this.updateIndicator();


    this.scrollToActiveTab();
  }

  trackByTab: TrackByFunction<TabConfig> = (index: number, tab: TabConfig) => {
    return tab.id;
  };


  private updateIndicator(): void {
    if (!this.tabsNav?.nativeElement || !this.activeTabId) {
      this.indicatorTransform = 'translateX(0) scaleX(0)';
      return;
    }

    const activeButton = this.tabsNav.nativeElement.querySelector(
      `.ds-tab-button[data-tab-id="${this.activeTabId}"]`
    ) as HTMLButtonElement;

    if (!activeButton) {
      this.indicatorTransform = 'translateX(0) scaleX(0)';
      return;
    }

    const navRect = this.tabsNav.nativeElement.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    if (this.vertical) {

      const offsetTop = buttonRect.top - navRect.top;
      const height = buttonRect.height;
      this.indicatorTransform = `translateY(${offsetTop}px) scaleY(${height / 3})`;
    } else {

      const offsetLeft = buttonRect.left - navRect.left;
      const width = buttonRect.width;
      this.indicatorTransform = `translateX(${offsetLeft}px) scaleX(${width / 100})`;
    }
  }

  private scrollToActiveTab(): void {
    if (!this.scrollable || !this.tabsNav?.nativeElement || !this.activeTabId) {
      return;
    }

    const activeButton = this.tabsNav.nativeElement.querySelector(
      `.ds-tab-button[data-tab-id="${this.activeTabId}"]`
    ) as HTMLButtonElement;

    if (!activeButton) {
      return;
    }


    activeButton.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }


  getTabButtonClasses(tab: TabConfig): string[] {
    const classes = ['ds-tab-button'];

    if (tab.id === this.activeTabId) {
      classes.push('active');
    }

    if (tab.disabled) {
      classes.push('disabled');
    }

    return classes;
  }

  formatBadge(badge: string | number): string {
    if (typeof badge === 'number') {

      return badge > 99 ? '99+' : badge.toString();
    }
    return badge;
  }

  isTabActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }

  getTabById(tabId: string): TabConfig | undefined {
    return this.tabs.find(tab => tab.id === tabId);
  }


  navigateToNextTab(): void {
    const currentIndex = this.tabs.findIndex(tab => tab.id === this.activeTabId);
    if (currentIndex === -1) return;


    for (let i = currentIndex + 1; i < this.tabs.length; i++) {
      if (!this.tabs[i].disabled) {
        this.selectTab(this.tabs[i].id);
        return;
      }
    }


    for (let i = 0; i <= currentIndex; i++) {
      if (!this.tabs[i].disabled) {
        this.selectTab(this.tabs[i].id);
        return;
      }
    }
  }

  navigateToPrevTab(): void {
    const currentIndex = this.tabs.findIndex(tab => tab.id === this.activeTabId);
    if (currentIndex === -1) return;


    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!this.tabs[i].disabled) {
        this.selectTab(this.tabs[i].id);
        return;
      }
    }


    for (let i = this.tabs.length - 1; i >= currentIndex; i--) {
      if (!this.tabs[i].disabled) {
        this.selectTab(this.tabs[i].id);
        return;
      }
    }
  }


  onKeyDown(event: KeyboardEvent, tabId: string): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectTab(tabId);
        break;

      case 'ArrowRight':
        if (!this.vertical) {
          event.preventDefault();
          this.navigateToNextTab();
        }
        break;

      case 'ArrowLeft':
        if (!this.vertical) {
          event.preventDefault();
          this.navigateToPrevTab();
        }
        break;

      case 'ArrowDown':
        if (this.vertical) {
          event.preventDefault();
          this.navigateToNextTab();
        }
        break;

      case 'ArrowUp':
        if (this.vertical) {
          event.preventDefault();
          this.navigateToPrevTab();
        }
        break;

      case 'Home':
        event.preventDefault();
        const firstEnabledTab = this.tabs.find(tab => !tab.disabled);
        if (firstEnabledTab) {
          this.selectTab(firstEnabledTab.id);
        }
        break;

      case 'End':
        event.preventDefault();
        const lastEnabledTab = [...this.tabs].reverse().find(tab => !tab.disabled);
        if (lastEnabledTab) {
          this.selectTab(lastEnabledTab.id);
        }
        break;
    }
  }
}
