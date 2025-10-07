/**
 * Enum dos perfis de usuário disponíveis no sistema
 */
export enum UserProfile {
    DEFAULT = 'DEFAULT',
    PRINTING = 'PRINTING',
    ADMIN = 'ADMIN',
    FINANCIAL = 'FINANCIAL'
}

/**
 * Enum das permissões disponíveis no sistema
 */
export enum Permission {
    // Clientes
    VIEW_CLIENTS = 'VIEW_CLIENTS',
    CREATE_CLIENTS = 'CREATE_CLIENTS',
    EDIT_CLIENTS = 'EDIT_CLIENTS',
    DELETE_CLIENTS = 'DELETE_CLIENTS',

    // Desenvolvimentos
    VIEW_DEVELOPMENTS = 'VIEW_DEVELOPMENTS',
    CREATE_DEVELOPMENTS = 'CREATE_DEVELOPMENTS',
    EDIT_DEVELOPMENTS = 'EDIT_DEVELOPMENTS',
    DELETE_DEVELOPMENTS = 'DELETE_DEVELOPMENTS',

    // Ordens de Produção
    VIEW_PRODUCTION_ORDERS = 'VIEW_PRODUCTION_ORDERS',
    CREATE_PRODUCTION_ORDERS = 'CREATE_PRODUCTION_ORDERS',
    EDIT_PRODUCTION_ORDERS = 'EDIT_PRODUCTION_ORDERS',
    DELETE_PRODUCTION_ORDERS = 'DELETE_PRODUCTION_ORDERS',

    // Fichas de Produção
    VIEW_PRODUCTION_SHEETS = 'VIEW_PRODUCTION_SHEETS',
    CREATE_PRODUCTION_SHEETS = 'CREATE_PRODUCTION_SHEETS',
    EDIT_PRODUCTION_SHEETS = 'EDIT_PRODUCTION_SHEETS',
    DELETE_PRODUCTION_SHEETS = 'DELETE_PRODUCTION_SHEETS',
    EDIT_PRODUCTION_SHEET_STEP = 'EDIT_PRODUCTION_SHEET_STEP', // Só pode alterar etapa
    EDIT_PRODUCTION_SHEET_MACHINE_VALUE = 'EDIT_PRODUCTION_SHEET_MACHINE_VALUE', // Só pode alterar valor de máquina

    // Fichas de Entrega
    VIEW_DELIVERY_SHEETS = 'VIEW_DELIVERY_SHEETS',
    CREATE_DELIVERY_SHEETS = 'CREATE_DELIVERY_SHEETS',
    EDIT_DELIVERY_SHEETS = 'EDIT_DELIVERY_SHEETS',
    DELETE_DELIVERY_SHEETS = 'DELETE_DELIVERY_SHEETS',

    // Recibos de Produção
    VIEW_PRODUCTION_RECEIPTS = 'VIEW_PRODUCTION_RECEIPTS',
    CREATE_PRODUCTION_RECEIPTS = 'CREATE_PRODUCTION_RECEIPTS',
    EDIT_PRODUCTION_RECEIPTS = 'EDIT_PRODUCTION_RECEIPTS',
    DELETE_PRODUCTION_RECEIPTS = 'DELETE_PRODUCTION_RECEIPTS'
}

/**
 * Mapeamento de permissões por perfil de usuário
 */
export const PROFILE_PERMISSIONS: Record<UserProfile, Permission[]> = {
    [UserProfile.DEFAULT]: [
        // Acessa todos os endpoints menos relacionados a recibos
        Permission.VIEW_CLIENTS,
        Permission.CREATE_CLIENTS,
        Permission.EDIT_CLIENTS,
        Permission.DELETE_CLIENTS,
        Permission.VIEW_DEVELOPMENTS,
        Permission.CREATE_DEVELOPMENTS,
        Permission.EDIT_DEVELOPMENTS,
        Permission.DELETE_DEVELOPMENTS,
        Permission.VIEW_PRODUCTION_ORDERS,
        Permission.CREATE_PRODUCTION_ORDERS,
        Permission.EDIT_PRODUCTION_ORDERS,
        Permission.DELETE_PRODUCTION_ORDERS,
        Permission.VIEW_PRODUCTION_SHEETS,
        Permission.CREATE_PRODUCTION_SHEETS,
        Permission.EDIT_PRODUCTION_SHEETS,
        Permission.DELETE_PRODUCTION_SHEETS,
        Permission.VIEW_DELIVERY_SHEETS,
        Permission.CREATE_DELIVERY_SHEETS,
        Permission.EDIT_DELIVERY_SHEETS,
        Permission.DELETE_DELIVERY_SHEETS
    ],

    [UserProfile.PRINTING]: [
        // Só endpoints relacionados a fichas de produção
        // Só pode alterar etapa e valor de máquina
        // Só pode alterar etapa quando ordem de produção estiver com status PILOT_PRODUCTION
        Permission.VIEW_PRODUCTION_SHEETS,
        Permission.EDIT_PRODUCTION_SHEET_STEP,
        Permission.EDIT_PRODUCTION_SHEET_MACHINE_VALUE
    ],

    [UserProfile.ADMIN]: [
        // Sem restrição - todas as permissões
        Permission.VIEW_CLIENTS,
        Permission.CREATE_CLIENTS,
        Permission.EDIT_CLIENTS,
        Permission.DELETE_CLIENTS,
        Permission.VIEW_DEVELOPMENTS,
        Permission.CREATE_DEVELOPMENTS,
        Permission.EDIT_DEVELOPMENTS,
        Permission.DELETE_DEVELOPMENTS,
        Permission.VIEW_PRODUCTION_ORDERS,
        Permission.CREATE_PRODUCTION_ORDERS,
        Permission.EDIT_PRODUCTION_ORDERS,
        Permission.DELETE_PRODUCTION_ORDERS,
        Permission.VIEW_PRODUCTION_SHEETS,
        Permission.CREATE_PRODUCTION_SHEETS,
        Permission.EDIT_PRODUCTION_SHEETS,
        Permission.DELETE_PRODUCTION_SHEETS,
        Permission.EDIT_PRODUCTION_SHEET_STEP,
        Permission.EDIT_PRODUCTION_SHEET_MACHINE_VALUE,
        Permission.VIEW_DELIVERY_SHEETS,
        Permission.CREATE_DELIVERY_SHEETS,
        Permission.EDIT_DELIVERY_SHEETS,
        Permission.DELETE_DELIVERY_SHEETS,
        Permission.VIEW_PRODUCTION_RECEIPTS,
        Permission.CREATE_PRODUCTION_RECEIPTS,
        Permission.EDIT_PRODUCTION_RECEIPTS,
        Permission.DELETE_PRODUCTION_RECEIPTS
    ],

    [UserProfile.FINANCIAL]: [
        // Acessa endpoints relacionados a recibos e clientes
        Permission.VIEW_CLIENTS,
        Permission.CREATE_CLIENTS,
        Permission.EDIT_CLIENTS,
        Permission.DELETE_CLIENTS,
        Permission.VIEW_PRODUCTION_RECEIPTS,
        Permission.CREATE_PRODUCTION_RECEIPTS,
        Permission.EDIT_PRODUCTION_RECEIPTS,
        Permission.DELETE_PRODUCTION_RECEIPTS
    ]
};

/**
 * Mapeamento de rotas para permissões
 */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
    '/authorized/clients': Permission.VIEW_CLIENTS,
    '/authorized/developments': Permission.VIEW_DEVELOPMENTS,
    '/authorized/production-orders': Permission.VIEW_PRODUCTION_ORDERS,
    '/authorized/production-sheets': Permission.VIEW_PRODUCTION_SHEETS,
    '/authorized/delivery-sheets': Permission.VIEW_DELIVERY_SHEETS,
    '/authorized/production-receipt': Permission.VIEW_PRODUCTION_RECEIPTS
};

/**
 * Mapeamento de itens de menu para permissões
 */
export const MENU_ITEM_PERMISSIONS: Record<string, Permission> = {
    'clients': Permission.VIEW_CLIENTS,
    'developments': Permission.VIEW_DEVELOPMENTS,
    'production-orders': Permission.VIEW_PRODUCTION_ORDERS,
    'production-sheets': Permission.VIEW_PRODUCTION_SHEETS,
    'delivery-sheets': Permission.VIEW_DELIVERY_SHEETS,
    'production-receipt': Permission.VIEW_PRODUCTION_RECEIPTS
};
