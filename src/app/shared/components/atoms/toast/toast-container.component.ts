import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastComponent, ToastConfig } from './toast.component';

@Component({
    selector: 'ds-toast-container',
    imports: [CommonModule, ToastComponent],
    templateUrl: './toast-container.component.html',
    styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent implements OnInit, OnDestroy {
    toasts: ToastConfig[] = [];

    ngOnInit(): void {
        // Registrar o container globalmente para receber toasts
        (window as any).toastContainer = this;
    }

    ngOnDestroy(): void {
        // Limpar referência global
        if ((window as any).toastContainer === this) {
            delete (window as any).toastContainer;
        }
    }

    addToast(config: ToastConfig): void {
        const toast: ToastConfig = {
            duration: 5000, // 5 segundos por padrão
            closable: true,
            ...config
        };

        this.toasts.push(toast);

        // Auto-remove após a duração especificada
        if (toast.duration && toast.duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, toast.duration);
        }
    }

    removeToast(toast: ToastConfig): void {
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
            this.toasts.splice(index, 1);
        }
    }

    clearAllToasts(): void {
        this.toasts = [];
    }

    // Métodos de conveniência para cada tipo
    success(message: string, title?: string, options?: Partial<ToastConfig>): void {
        this.addToast({
            type: 'success',
            message,
            title,
            ...options
        });
    }

    error(message: string, title?: string, options?: Partial<ToastConfig>): void {
        this.addToast({
            type: 'error',
            message,
            title,
            ...options
        });
    }

    warning(message: string, title?: string, options?: Partial<ToastConfig>): void {
        this.addToast({
            type: 'warning',
            message,
            title,
            ...options
        });
    }

    info(message: string, title?: string, options?: Partial<ToastConfig>): void {
        this.addToast({
            type: 'info',
            message,
            title,
            ...options
        });
    }

    trackByToast(index: number, toast: ToastConfig): string {
        return `${toast.type}-${toast.message}-${index}`;
    }
}
