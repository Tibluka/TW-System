
export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    route?: string;
    action?: () => void;
    children?: MenuItem[];
    disabled?: boolean;
}
