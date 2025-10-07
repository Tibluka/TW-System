import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/atoms/toast/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToastContainerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tw-system';
}
