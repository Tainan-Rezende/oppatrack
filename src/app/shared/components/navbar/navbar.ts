import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Login } from '../login/login';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Login],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  public isMenuOpen: boolean;
  public menuList: string[];
  public isAuthOpen: boolean;

  constructor() {
    this.isMenuOpen = false;
    this.menuList = [];
    this.isAuthOpen = false;
  }

  public openAuth(): void {
    this.isAuthOpen = true;
  }

  public closeAuth(): void {
    this.isAuthOpen = false;
  }
}
