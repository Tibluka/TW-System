import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from '../permissions/permissions.service';

/**
 * Guard que protege rotas baseado nas permissões do usuário
 * 
 * Uso nas rotas:
 * {
 *   path: 'clients',
 *   component: ClientsComponent,
 *   canActivate: [permissionsGuard(Permission.VIEW_CLIENTS)]
 * }
 */
export const permissionsGuard = (requiredPermission: string) => {
    const canActivate: CanActivateFn = (route, state) => {
        const permissionsService = inject(PermissionsService);
        const router = inject(Router);

        // Verifica se o usuário tem a permissão necessária
        if (permissionsService.canAccessRoute(state.url)) {
            return true;
        }

        // Se não tem permissão, redireciona para uma página de acesso negado
        // ou para a página inicial (dependendo da sua preferência)
        router.navigate(['/authorized']);
        return false;
    };

    return canActivate;
};

/**
 * Guard que protege rotas baseado no perfil do usuário
 * 
 * Uso nas rotas:
 * {
 *   path: 'admin-only',
 *   component: AdminComponent,
 *   canActivate: [profileGuard(UserProfile.ADMIN)]
 * }
 */
export const profileGuard = (requiredProfile: string) => {
    const canActivate: CanActivateFn = (route, state) => {
        const permissionsService = inject(PermissionsService);
        const router = inject(Router);

        // Verifica se o usuário tem o perfil necessário
        if (permissionsService.isUserProfile(requiredProfile as any)) {
            return true;
        }

        // Se não tem o perfil, redireciona
        router.navigate(['/authorized']);
        return false;
    };

    return canActivate;
};

/**
 * Guard que protege rotas baseado em múltiplas permissões (OR)
 * O usuário precisa ter pelo menos uma das permissões
 * 
 * Uso nas rotas:
 * {
 *   path: 'some-route',
 *   component: SomeComponent,
 *   canActivate: [anyPermissionGuard([Permission.VIEW_CLIENTS, Permission.VIEW_DEVELOPMENTS])]
 * }
 */
export const anyPermissionGuard = (permissions: string[]) => {
    const canActivate: CanActivateFn = (route, state) => {
        const permissionsService = inject(PermissionsService);
        const router = inject(Router);

        // Verifica se o usuário tem pelo menos uma das permissões
        if (permissionsService.hasAnyPermission(permissions as any)) {
            return true;
        }

        // Se não tem nenhuma permissão, redireciona
        router.navigate(['/authorized']);
        return false;
    };

    return canActivate;
};

/**
 * Guard que protege rotas baseado em múltiplas permissões (AND)
 * O usuário precisa ter todas as permissões
 * 
 * Uso nas rotas:
 * {
 *   path: 'some-route',
 *   component: SomeComponent,
 *   canActivate: [allPermissionsGuard([Permission.VIEW_CLIENTS, Permission.EDIT_CLIENTS])]
 * }
 */
export const allPermissionsGuard = (permissions: string[]) => {
    const canActivate: CanActivateFn = (route, state) => {
        const permissionsService = inject(PermissionsService);
        const router = inject(Router);

        // Verifica se o usuário tem todas as permissões
        if (permissionsService.hasAllPermissions(permissions as any)) {
            return true;
        }

        // Se não tem todas as permissões, redireciona
        router.navigate(['/authorized']);
        return false;
    };

    return canActivate;
};
