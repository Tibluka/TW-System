import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
    selector: 'ds-header',
    imports: [
        CommonModule,
        IconComponent
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    @Input() title: string = 'TW System';
    @Input() showMenuButton: boolean = true;
    @Input() isMenuOpen: boolean = false;

    @Output() menuToggle = new EventEmitter<void>();

    onMenuToggle(): void {
        this.menuToggle.emit();
    }
}
