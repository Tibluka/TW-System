import { ListViewConfig } from "../../models/list-view/list-view";
import { ViewMode } from "../services/list-view/list-view.service";

export interface ListViewMixin {
    listViewConfig: ListViewConfig;
    currentViewMode: ViewMode;
    onViewModeChange(mode: ViewMode): void;
}

export function createListViewMixin(
    storageKey: string,
    defaultConfig: Partial<ListViewConfig> = {}
): Partial<ListViewMixin> {
    return {
        listViewConfig: {
            showToggle: true,
            defaultView: 'table',
            storageKey,
            ...defaultConfig
        },

        onViewModeChange(mode: ViewMode) {
            localStorage.setItem(`${storageKey}-view-mode`, mode);
            // Analytics opcional
            console.log(`View mode changed to ${mode} for ${storageKey}`);
        }
    };
}