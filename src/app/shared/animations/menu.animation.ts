// src/app/shared/animations/menu.animations.ts
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

export const menuAnimations = {
    // Animação do container do menu
    slideMenu: trigger('slideMenu', [
        state('expanded', style({
            width: '300px'
        })),
        state('collapsed', style({
            width: '104px'
        })),
        transition('expanded <=> collapsed', [
            animate('500ms cubic-bezier(0.4, 0, 0.2, 1)')
        ])
    ]),

    // Animação para fade do texto
    fadeText: trigger('fadeText', [
        state('visible', style({
            opacity: 1,
            visibility: 'visible'
        })),
        state('hidden', style({
            opacity: 0,
            visibility: 'hidden'
        })),
        transition('visible => hidden', [
            animate('200ms ease-out')
        ]),
        transition('hidden => visible', [
            animate('200ms 300ms ease-in') // Delay para aguardar a expansão
        ])
    ]),

    // Animação para os ícones
    scaleIcon: trigger('scaleIcon', [
        transition('* => collapsed', [
            animate('300ms ease-out', style({
                transform: 'scale(1.1)'
            }))
        ]),
        transition('* => expanded', [
            animate('300ms ease-out', style({
                transform: 'scale(1)'
            }))
        ])
    ])
};