// src/app/shared/animations/fade.animation.ts
import { trigger, state, style, transition, animate, group } from '@angular/animations';

export const fadeAnimation = trigger('fade', [
    state('in', style({
        opacity: 1,
        transform: 'scale(1) translateY(0)',
        filter: 'blur(0px)'
    })),

    state('out', style({
        opacity: 0,
        transform: 'scale(0.95) translateY(20px)',
        filter: 'blur(2px)'
    })),

    transition('void => in', [
        style({
            opacity: 0,
            transform: 'scale(0.95) translateY(20px)',
            filter: 'blur(2px)'
        }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({
            opacity: 1,
            transform: 'scale(1) translateY(0)',
            filter: 'blur(0px)'
        }))
    ]),

    transition('in => void', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
            opacity: 0,
            transform: 'scale(0.95) translateY(-15px)',
            filter: 'blur(2px)'
        }))
    ])
]);

export const backdropFadeAnimation = trigger('backdropFade', [
    state('in', style({
        opacity: 1,
        backdropFilter: 'blur(4px)'
    })),

    state('out', style({
        opacity: 0,
        backdropFilter: 'blur(0px)'
    })),

    transition('void => in', [
        style({
            opacity: 0,
            backdropFilter: 'blur(0px)'
        }),
        animate('350ms cubic-bezier(0.4, 0, 0.2, 1)', style({
            opacity: 1,
            backdropFilter: 'blur(4px)'
        }))
    ]),

    transition('in => void', [
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({
            opacity: 0,
            backdropFilter: 'blur(0px)'
        }))
    ])
]);

export const slideInContentAnimation = trigger('slideInContent', [
    state('in', style({
        opacity: 1,
        transform: 'translateY(0)'
    })),

    transition('void => in', [
        style({
            opacity: 0,
            transform: 'translateY(10px)'
        }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1) 100ms', style({
            opacity: 1,
            transform: 'translateY(0)'
        }))
    ])
]);

// Animação combinada para modal completo
export const modalAnimations = [
    fadeAnimation,
    backdropFadeAnimation,
    slideInContentAnimation
];