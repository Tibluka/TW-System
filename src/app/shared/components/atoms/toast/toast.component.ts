import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
    type: ToastType;
    title?: string;
    message: string;
    icon?: string;
    duration?: number;
    closable?: boolean;
}

@Component({
    selector: 'ds-toast',
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss'
})
export class ToastComponent implements OnInit, OnDestroy {
    @Input() config!: ToastConfig;
    @Output() close = new EventEmitter<void>();

    private timeoutId?: number;

    ngOnInit(): void {

        if (this.config.duration && this.config.duration > 0) {
            this.timeoutId = window.setTimeout(() => {
                this.closeToast();
            }, this.config.duration);
        }
    }

    ngOnDestroy(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    closeToast(): void {
        this.close.emit();
    }

    getIconClass(): string {
        if (this.config.icon) {
            return this.config.icon;
        }


        const defaultIcons: Record<ToastType, string> = {
            success: 'fa-solid fa-check-circle',
            error: 'fa-solid fa-exclamation-circle',
            warning: 'fa-solid fa-triangle-exclamation',
            info: 'fa-solid fa-info-circle'
        };

        return defaultIcons[this.config.type];
    }

    getToastClass(): string {
        return `ds-toast toast-${this.config.type}`;
    }
}
