import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { DramaTrackerModal } from '../../../shared/components/drama-tracker-modal/drama-tracker-modal';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Footer, DramaTrackerModal],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout { }
