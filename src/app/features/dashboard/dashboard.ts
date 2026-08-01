import { Component } from '@angular/core';
import { Navbar } from '../components/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  imports: [Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard { }
