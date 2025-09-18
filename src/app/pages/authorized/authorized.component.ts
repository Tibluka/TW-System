import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '../../shared/components/layout/menu/menu.component';

@Component({
  selector: 'app-authorized',
  imports: [
    RouterOutlet,
    MenuComponent
  ],
  templateUrl: './authorized.component.html',
  styleUrl: './authorized.component.scss'
})
export class AuthorizedComponent {

}
