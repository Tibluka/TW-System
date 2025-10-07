import { Injectable, computed, signal, inject } from '@angular/core';
import { UserProfile, Permission, PROFILE_PERMISSIONS, ROUTE_PERMISSIONS, MENU_ITEM_PERMISSIONS } from '../../../models/permissions/permissions';
import { AuthService, User } from '../auth/auth-service';

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {
    private readonly authService = inject(AuthService);

    private readonly _currentUser = signal<User | null>(null);
    private readonly _userProfile = signal<UserProfile | null>(null);
    private readonly _userPermissions = signal<Permission[]>([]);

    readonly currentUser = this._currentUser.asReadonly();
    readonly userProfile = this._userProfile.asReadonly();
    readonly userPermissions = this._userPermissions.asReadonly();

    // Computed properties
    readonly isAdmin = computed(() => this._userProfile() === UserProfile.ADMIN);
    readonly isDefault = computed(() => this._userProfile() === UserProfile.DEFAULT);
    readonly isPrinting = computed(() => this._userProfile() === UserProfile.PRINTING);
    readonly isFinancial = computed(() => this._userProfile() === UserProfile.FINANCIAL);

    constructor() {
        this.initializePermissions();
        this.setupAuthListener();
    }

    /**
     * Inicializa as permissões baseado no usuário atual
     */
    private initializePermissions(): void {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.updateUserPermissions(user);
        }
    }

    /**
     * Configura listener para mudanças de autenticação
     */
    private setupAuthListener(): void {
        this.authService.currentUser$.subscribe(user => {
            this.updateUserPermissions(user);
        });
    }

    /**
     * Atualiza as permissões do usuário
     */
    private updateUserPermissions(user: User | null): void {
        this._currentUser.set(user);

        if (!user) {
            this._userProfile.set(null);
            this._userPermissions.set([]);
            return;
        }

        // Mapeia o role do usuário para o enum UserProfile
        const profile = this.mapRoleToProfile(user.role);
        this._userProfile.set(profile);

        // Obtém as permissões do perfil
        const permissions = PROFILE_PERMISSIONS[profile] || [];
        this._userPermissions.set(permissions);
    }

    /**
     * Mapeia o role do usuário para o enum UserProfile
     */
    private mapRoleToProfile(role: string): UserProfile {
        switch (role.toUpperCase()) {
            case 'DEFAULT':
                return UserProfile.DEFAULT;
            case 'PRINTING':
                return UserProfile.PRINTING;
            case 'ADMIN':
                return UserProfile.ADMIN;
            case 'FINANCIAL':
                return UserProfile.FINANCIAL;
            default:
                return UserProfile.DEFAULT; // Fallback para DEFAULT
        }
    }

    /**
     * Verifica se o usuário tem uma permissão específica
     */
    hasPermission(permission: Permission): boolean {
        const permissions = this._userPermissions();
        return permissions.includes(permission);
    }

    /**
     * Verifica se o usuário tem pelo menos uma das permissões fornecidas
     */
    hasAnyPermission(permissions: Permission[]): boolean {
        return permissions.some(permission => this.hasPermission(permission));
    }

    /**
     * Verifica se o usuário tem todas as permissões fornecidas
     */
    hasAllPermissions(permissions: Permission[]): boolean {
        return permissions.every(permission => this.hasPermission(permission));
    }

    /**
     * Verifica se o usuário pode acessar uma rota específica
     */
    canAccessRoute(route: string): boolean {
        const requiredPermission = ROUTE_PERMISSIONS[route];
        if (!requiredPermission) {
            return true; // Se não há permissão definida, permite acesso
        }

        return this.hasPermission(requiredPermission);
    }

    /**
     * Verifica se o usuário pode ver um item de menu específico
     */
    canViewMenuItem(menuItemId: string): boolean {
        const requiredPermission = MENU_ITEM_PERMISSIONS[menuItemId];
        if (!requiredPermission) {
            return true; // Se não há permissão definida, permite visualização
        }

        return this.hasPermission(requiredPermission);
    }

    /**
     * Verifica se o usuário pode executar uma ação específica
     */
    canExecuteAction(action: Permission): boolean {
        return this.hasPermission(action);
    }

    /**
     * Obtém todas as permissões do usuário atual
     */
    getCurrentUserPermissions(): Permission[] {
        return [...this._userPermissions()];
    }

    /**
     * Obtém o perfil do usuário atual
     */
    getCurrentUserProfile(): UserProfile | null {
        return this._userProfile();
    }

    /**
     * Verifica se o usuário é de um perfil específico
     */
    isUserProfile(profile: UserProfile): boolean {
        return this._userProfile() === profile;
    }

    /**
     * Verifica se o usuário pode alterar etapa de ficha de produção
     * (regra especial: só quando ordem de produção estiver com status PILOT_PRODUCTION)
     */
    canEditProductionSheetStep(): boolean {
        // Esta verificação específica deve ser implementada no componente
        // que tem acesso ao status da ordem de produção
        return this.hasPermission(Permission.EDIT_PRODUCTION_SHEET_STEP);
    }

    /**
     * Verifica se o usuário pode alterar valor de máquina
     */
    canEditMachineValue(): boolean {
        return this.hasPermission(Permission.EDIT_PRODUCTION_SHEET_MACHINE_VALUE);
    }

    /**
     * Filtra itens de menu baseado nas permissões do usuário
     */
    filterMenuItemsByPermissions(menuItems: any[]): any[] {
        return menuItems.filter(item => this.canViewMenuItem(item.id));
    }

    /**
     * Obtém a primeira rota disponível baseada nas permissões do usuário
     */
    getFirstAvailableRoute(): string {
        const routes = [
            { path: '/authorized/clients', permission: Permission.VIEW_CLIENTS },
            { path: '/authorized/developments', permission: Permission.VIEW_DEVELOPMENTS },
            { path: '/authorized/production-orders', permission: Permission.VIEW_PRODUCTION_ORDERS },
            { path: '/authorized/production-sheets', permission: Permission.VIEW_PRODUCTION_SHEETS },
            { path: '/authorized/delivery-sheets', permission: Permission.VIEW_DELIVERY_SHEETS },
            { path: '/authorized/production-receipt', permission: Permission.VIEW_PRODUCTION_RECEIPTS }
        ];

        // Encontra a primeira rota que o usuário tem permissão
        const availableRoute = routes.find(route => this.hasPermission(route.permission));

        // Retorna a primeira rota disponível ou '/authorized' como fallback
        return availableRoute?.path || '/authorized';
    }
}
