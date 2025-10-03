import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

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
export class ActionMenuComponent implements AfterViewInit {

    @Input() items: ActionMenuItem[] = [];
    @Input() triggerIcon: string = 'fa-solid fa-ellipsis-vertical';
    @Input() disabled: boolean = false;

    @Output() itemSelected = new EventEmitter<ActionMenuItem>();

    @ViewChild('dropdown', { static: false }) dropdownRef?: ElementRef;

    isOpen: boolean = false;
    dropdownPosition: 'bottom' | 'top' = 'bottom';

    constructor(private elementRef: ElementRef) { }

    ngAfterViewInit() {
        // Detectar quando o dropdown é aberto para calcular posição
    }

    toggleMenu(event: Event) {
        event.stopPropagation();
        if (!this.disabled) {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                // Aguardar o próximo ciclo para que o DOM seja atualizado
                setTimeout(() => {
                    this.calculateDropdownPosition();
                }, 0);
            }
        }
    }

    selectItem(item: ActionMenuItem, event: Event) {
        event.stopPropagation();
        if (!item.disabled) {
            this.itemSelected.emit(item);
            this.isOpen = false;
        }
    }

    private calculateDropdownPosition() {
        if (!this.dropdownRef) return;

        const triggerElement = this.elementRef.nativeElement.querySelector('.action-menu-trigger');
        const dropdownElement = this.dropdownRef.nativeElement;

        if (!triggerElement || !dropdownElement) return;

        const triggerRect = triggerElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Estimar altura do dropdown baseada no número de itens
        const estimatedDropdownHeight = this.items.length * 40 + 16; // 40px por item + padding

        // Calcular espaço disponível abaixo e acima do trigger
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        // Determinar posição vertical
        if (spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight) {
            this.dropdownPosition = 'top';
        } else {
            this.dropdownPosition = 'bottom';
        }

        // Aplicar posicionamento fixo para evitar problemas com overflow
        this.applyFixedPosition(triggerRect, dropdownElement);
    }

    private applyFixedPosition(triggerRect: DOMRect, dropdownElement: HTMLElement) {
        const estimatedDropdownHeight = this.items.length * 40 + 16;
        const dropdownWidth = 200; // min-width definido no CSS

        let top: number;
        let left: number;

        if (this.dropdownPosition === 'top') {
            top = triggerRect.top - estimatedDropdownHeight - 4;
        } else {
            top = triggerRect.bottom + 4;
        }

        // Centralizar horizontalmente em relação ao trigger
        left = triggerRect.right - dropdownWidth;

        // Ajustar se sair da tela
        if (left < 8) {
            left = 8;
        } else if (left + dropdownWidth > window.innerWidth - 8) {
            left = window.innerWidth - dropdownWidth - 8;
        }

        // Aplicar posição fixa
        dropdownElement.style.position = 'fixed';
        dropdownElement.style.top = `${top}px`;
        dropdownElement.style.left = `${left}px`;
        dropdownElement.style.right = 'auto';
        dropdownElement.style.bottom = 'auto';
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        // Verificar se o clique foi fora do componente
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }
}
