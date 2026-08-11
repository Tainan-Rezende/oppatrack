import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Login } from '../login/login';
import { MenuItem } from '../../../models/navbar-item';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Login],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  public isMenuOpen: boolean;
  public menuList: MenuItem[];
  public isAuthOpen: boolean;

  constructor() {
    this.isMenuOpen = false;
    this.menuList = [
      { label: 'Início', route: '/home', icon: 'fa-solid fa-house', exact: true },
      { label: 'Dramas', route: '/dramas', icon: 'fa-solid fa-list' }
    ];
    this.isAuthOpen = false;
  }

  public openAuth(): void {
    this.isAuthOpen = true;
  }

  public closeAuth(): void {
    this.isAuthOpen = false;
  }
}
