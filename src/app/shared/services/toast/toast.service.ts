import { Injectable } from '@angular/core';
import { ToastConfig } from '../../components/atoms/toast/toast.component';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    private getContainer(): any {
        return (window as any).toastContainer;
    }

    private showToast(config: ToastConfig): void {
        const container = this.getContainer();
        if (container) {
            container.addToast(config);
        } else {
        }
    }

    success(message: string, title?: string, options?: Partial<ToastConfig>): void {
        this.showToast({
            type: 'success',
            message,
            title,
            duration: 5000,
            closable: true,
            ...options
        });
    }

    error(message: string, title?: string, options?: Partial<ToastConfig>): void {
        this.showToast({
            type: 'error',
            message,
            title,
            duration: 7000, // Erros ficam mais tempo
            closable: true,
            ...options
        });
    }

    warning(message: string, title?: string, options?: Partial<ToastConfig>): void {
        this.showToast({
            type: 'warning',
            message,
            title,
            duration: 6000,
            closable: true,
            ...options
        });
    }

    info(message: string, title?: string, options?: Partial<ToastConfig>): void {
        this.showToast({
            type: 'info',
            message,
            title,
            duration: 5000,
            closable: true,
            ...options
        });
    }

    custom(config: ToastConfig): void {
        this.showToast({
            duration: 5000,
            closable: true,
            ...config
        });
    }

    clearAll(): void {
        const container = this.getContainer();
        if (container) {
            container.clearAllToasts();
        }
    }
}
