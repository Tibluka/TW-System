import { ListViewConfig } from "../../models/list-view/list-view";
import { ViewMode } from "../services/list-view/list-view.service";

export class ListViewUtils {

    /**
     * Gera configuração padrão baseada no tipo de entidade
     */
    static getDefaultConfig(entityType: string): ListViewConfig {
        const configs: { [key: string]: ListViewConfig } = {
            'developments': {
                cardConfig: { minWidth: '350px', gap: '24px' },
                defaultView: 'table'
            },
            'production-sheets': {
                cardConfig: { minWidth: '320px', gap: '20px' },
                defaultView: 'cards'
            },
            'clients': {
                cardConfig: { columns: 3, gap: '16px' },
                defaultView: 'table'
            },
            'orders': {
                cardConfig: { minWidth: '300px', gap: '20px' },
                defaultView: 'table'
            }
        };

        return {
            showToggle: true,
            storageKey: `${entityType}-view-mode`,
            density: 'normal',
            ...configs[entityType]
        };
    }

    /**
     * Responsividade automática - força cards em mobile
     */
    static getResponsiveViewMode(preferredMode: ViewMode): ViewMode {
        const isMobile = window.innerWidth < 768;
        return isMobile ? 'cards' : preferredMode;
    }

    /**
     * Tracking de analytics unificado
     */
    static trackViewChange(entityType: string, mode: ViewMode, analytics?: any) {
        if (analytics?.track) {
            analytics.track('list_view_changed', {
                entity_type: entityType,
                view_mode: mode,
                timestamp: new Date().toISOString()
            });
        }
    }
}
