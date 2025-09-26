
import { trigger, state, style, transition, animate } from '@angular/animations';


export const fadeAnimation = trigger('fade', [
    state('in', style({
        opacity: 1
    })),

    state('out', style({
        opacity: 0
    })),


    transition('void => in', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
    ]),


    transition('in => void', [
        animate('200ms ease-out', style({ opacity: 0 }))
    ]),


    transition('out => in', [
        animate('300ms ease-in')
    ]),

    transition('in => out', [
        animate('200ms ease-out')
    ])
]);


export const modalAnimations = [fadeAnimation];
