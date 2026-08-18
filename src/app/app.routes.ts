import { Routes } from '@angular/router';
import { MainLayout } from './core/layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },

      // Rotas Institucionais / Legais
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./features/legal/privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy),
      },
      {
        path: 'terms-of-service',
        loadComponent: () =>
          import('./features/legal/terms-of-service/terms-of-service').then(
            (m) => m.TermsOfService
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact').then((m) => m.Contact),
      },

      // Rotas Públicas do Catálogo
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'dramas',
        loadComponent: () =>
          import('./features/catalog/catalog').then((m) => m.Catalog),
      },
      {
        path: 'dramas/:id',
        loadComponent: () =>
          import('./features/drama-detail/drama-detail').then((m) => m.DramaDetail),
      },
      {
        path: 'actors',
        loadComponent: () =>
          import('./features/actors/actors').then((m) => m.Actors),
      },
      {
        path: 'actors/:id',
        loadComponent: () =>
          import('./features/actor-detail/actor-detail').then((m) => m.ActorDetail),
      },

      // Perfil (Próprio ou Público por ID/Código)
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/user/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'u/:id',
        loadComponent: () =>
          import('./features/user/profile/profile').then((m) => m.Profile),
      },

      // Área Privada do Usuário Logado (/account/...)
      {
        path: 'account',
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/user/dashboard/dashboard').then((m) => m.Dashboard),
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/user/settings/settings').then((m) => m.Settings),
          },
        ],
      },

      // Redirecionamentos de conveniência
      {
        path: 'dashboard',
        redirectTo: 'account/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'settings',
        redirectTo: 'account/settings',
        pathMatch: 'full',
      },
    ],
  },
];