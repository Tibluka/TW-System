// src/app/shared/animations/fade.animation.ts
import { trigger, state, style, transition, animate } from '@angular/animations';

// Apenas animação de fade simples
export const fadeAnimation = trigger('fade', [
    state('in', style({
        opacity: 1
    })),

    state('out', style({
        opacity: 0
    })),

    // Transição de entrada (void => in)
    transition('void => in', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
    ]),

    // Transição de saída (in => void)
    transition('in => void', [
        animate('200ms ease-out', style({ opacity: 0 }))
    ]),

    // Transições entre estados
    transition('out => in', [
        animate('300ms ease-in')
    ]),

    transition('in => out', [
        animate('200ms ease-out')
    ])
]);

// Exporta apenas a animação de fade
export const modalAnimations = [fadeAnimation];