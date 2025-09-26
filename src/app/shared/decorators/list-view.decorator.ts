import { ListViewConfig } from "../../models/list-view/list-view";
import { ViewMode } from "../services/list-view/list-view.service";
import { ListViewUtils } from "../utils/list-view";

export function WithListView(entityType: string, config?: Partial<ListViewConfig>) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            listViewConfig: ListViewConfig;
            currentViewMode: ViewMode = 'table';

            constructor(...args: any[]) {
                super(...args);

                this.listViewConfig = {
                    ...ListViewUtils.getDefaultConfig(entityType),
                    ...config
                };
                const saved = localStorage.getItem(`${entityType}-view-mode`) as ViewMode;
                if (saved) {
                    this.currentViewMode = saved;
                }
            }

            onViewModeChange(mode: ViewMode) {
                this.currentViewMode = mode;
                localStorage.setItem(`${entityType}-view-mode`, mode);
                ListViewUtils.trackViewChange(entityType, mode);
            }
        };
    };
}