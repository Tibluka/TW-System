import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface ActionMenuItem {
    label: string;
    value: string;
    icon?: string;
    disabled?: boolean;
}

@Component({
    selector: 'ds-action-menu',
    imports: [CommonModule],
    templateUrl: './action-menu.component.html',
    styleUrl: './action-menu.component.scss'
})
export class ActionMenuComponent {

    @Input() items: ActionMenuItem[] = [];
    @Input() triggerIcon: string = 'fa-solid fa-ellipsis-vertical';
    @Input() disabled: boolean = false;

    @Output() itemSelected = new EventEmitter<ActionMenuItem>();

    isOpen: boolean = false;

    toggleMenu(event: Event) {
        event.stopPropagation();
        if (!this.disabled) {
            this.isOpen = !this.isOpen;
        }
    }

    selectItem(item: ActionMenuItem, event: Event) {
        event.stopPropagation();
        if (!item.disabled) {
            this.itemSelected.emit(item);
            this.isOpen = false;
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        this.isOpen = false;
    }
}
