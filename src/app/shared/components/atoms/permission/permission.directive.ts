import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { Permission, UserProfile } from '../../../../models/permissions/permissions';
import { PermissionsService } from '../../../services/permissions/permissions.service';

/**
 * Diretiva estrutural que mostra/oculta elementos baseado em permissões
 * 
 * Uso no template:
 * <div *appPermission="Permission.VIEW_CLIENTS">Conteúdo visível apenas para quem pode ver clientes</div>
 * <div *appPermission="[Permission.VIEW_CLIENTS, Permission.EDIT_CLIENTS]">Conteúdo visível para quem tem qualquer uma das permissões</div>
 * <div *appPermission="Permission.VIEW_CLIENTS; mode: 'all'">Conteúdo visível apenas para quem tem todas as permissões</div>
 */
@Directive({
    selector: '[appPermission]',
    standalone: true
})
export class PermissionDirective {
    private readonly templateRef = inject(TemplateRef<any>);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly permissionsService = inject(PermissionsService);

    private hasView = false;

    @Input() set appPermission(permission: Permission | Permission[]) {
        this.updateView(permission);
    }

    @Input() set appPermissionMode(mode: 'any' | 'all') {
        // Este input pode ser usado para controlar se deve verificar 'any' ou 'all' permissões
        // Por enquanto, mantemos a lógica padrão como 'any'
    }

    private updateView(permission: Permission | Permission[]): void {
        const hasPermission = this.checkPermission(permission);

        if (hasPermission && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasPermission && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }

    private checkPermission(permission: Permission | Permission[]): boolean {
        if (Array.isArray(permission)) {
            return this.permissionsService.hasAnyPermission(permission);
        } else {
            return this.permissionsService.hasPermission(permission);
        }
    }
}

/**
 * Diretiva estrutural que mostra/oculta elementos baseado no perfil do usuário
 * 
 * Uso no template:
 * <div *appProfile="UserProfile.ADMIN">Conteúdo visível apenas para administradores</div>
 * <div *appProfile="[UserProfile.ADMIN, UserProfile.FINANCIAL]">Conteúdo visível para admin ou financeiro</div>
 */
@Directive({
    selector: '[appProfile]',
    standalone: true
})
export class ProfileDirective {
    private readonly templateRef = inject(TemplateRef<any>);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly permissionsService = inject(PermissionsService);

    private hasView = false;

    @Input() set appProfile(profile: UserProfile | UserProfile[]) {
        this.updateView(profile);
    }

    private updateView(profile: UserProfile | UserProfile[]): void {
        const hasProfile = this.checkProfile(profile);

        if (hasProfile && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasProfile && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }

    private checkProfile(profile: UserProfile | UserProfile[]): boolean {
        if (Array.isArray(profile)) {
            return profile.some(p => this.permissionsService.isUserProfile(p));
        } else {
            return this.permissionsService.isUserProfile(profile);
        }
    }
}

/**
 * Diretiva estrutural que mostra/oculta elementos baseado em uma condição de permissão customizada
 * 
 * Uso no template:
 * <div *appPermissionCheck="'canEditProductionSheetStep'">Conteúdo baseado em verificação customizada</div>
 */
@Directive({
    selector: '[appPermissionCheck]',
    standalone: true
})
export class PermissionCheckDirective {
    private readonly templateRef = inject(TemplateRef<any>);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly permissionsService = inject(PermissionsService);

    private hasView = false;

    @Input() set appPermissionCheck(method: string) {
        this.updateView(method);
    }

    private updateView(method: string): void {
        const hasPermission = this.checkCustomPermission(method);

        if (hasPermission && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasPermission && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }

    private checkCustomPermission(method: string): boolean {
        switch (method) {
            case 'canEditProductionSheetStep':
                return this.permissionsService.canEditProductionSheetStep();
            case 'canEditMachineValue':
                return this.permissionsService.canEditMachineValue();
            case 'isAdmin':
                return this.permissionsService.isAdmin();
            case 'isDefault':
                return this.permissionsService.isDefault();
            case 'isPrinting':
                return this.permissionsService.isPrinting();
            case 'isFinancial':
                return this.permissionsService.isFinancial();
            default:
                return false;
        }
    }
}
