import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '../../shared/components/layout/menu/menu.component';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';

@Component({
  selector: 'app-authorized',
  imports: [
    CommonModule,
    RouterOutlet,
    MenuComponent,
    HeaderComponent
  ],
  templateUrl: './authorized.component.html',
  styleUrl: './authorized.component.scss'
})
export class AuthorizedComponent implements OnInit {
  isMobile = false;
  isMenuOpen = false;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 600;

    // Fechar menu quando voltar para desktop
    if (!this.isMobile) {
      this.isMenuOpen = false;
    }
  }

  onMenuToggle(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onMenuClose(): void {
    this.isMenuOpen = false;
  }
}
