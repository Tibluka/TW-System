import { NgClass } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { getStatusColor, BadgeColor } from '../../../utils/status-colors';

@Component({
  selector: 'ds-badge',
  imports: [
    NgClass
  ],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  @Input() text: string = '';
  @Input() color: BadgeColor = 'gray';
  @Input() status: string = ''; // Status para mapeamento automático
  @Input() entityType: 'development' | 'production-order' | 'production-sheet' | 'production-receipt' | undefined = undefined;

  // Computed property para determinar a cor final
  computedColor = computed(() => {
    // Se status foi fornecido, usa mapeamento automático
    if (this.status) {
      return getStatusColor(this.status, this.entityType);
    }
    // Caso contrário, usa a cor fornecida diretamente
    return this.color;
  });
}
