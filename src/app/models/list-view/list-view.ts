export interface ListViewConfig {
    showToggle?: boolean;
    defaultView?: 'table' | 'cards';
    cardConfig?: {
        columns?: number;
        minWidth?: string;
        gap?: string;
    };
    storageKey?: string;
    density?: 'compact' | 'normal' | 'comfortable';
}
