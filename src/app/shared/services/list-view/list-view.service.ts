import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ViewMode = 'table' | 'cards';

@Injectable({
  providedIn: 'root'
})
export class ListViewService {
  private viewModes = new Map<string, BehaviorSubject<ViewMode>>();

  getViewMode(key: string, defaultMode: ViewMode = 'table'): BehaviorSubject<ViewMode> {
    if (!this.viewModes.has(key)) {
      const saved = localStorage.getItem(`${key}-view-mode`) as ViewMode;
      const initialMode = saved || defaultMode;
      this.viewModes.set(key, new BehaviorSubject(initialMode));
    }
    return this.viewModes.get(key)!;
  }

  setViewMode(key: string, mode: ViewMode): void {
    localStorage.setItem(`${key}-view-mode`, mode);
    if (this.viewModes.has(key)) {
      this.viewModes.get(key)!.next(mode);
    }
  }
  syncViewModes(): void {
    window.addEventListener('storage', (event) => {
      if (event.key?.endsWith('-view-mode')) {
        const key = event.key.replace('-view-mode', '');
        const newMode = event.newValue as ViewMode;
        if (this.viewModes.has(key) && newMode) {
          this.viewModes.get(key)!.next(newMode);
        }
      }
    });
  }
}