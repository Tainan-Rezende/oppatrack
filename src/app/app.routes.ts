import { Routes } from '@angular/router';
import { MainLayout } from './core/layouts/main-layout/main-layout';

export const routes: Routes = [
    {
        path: "",
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                loadComponent: () => import('./features/home/home').then(m => m.Home)
            },
            {
                path: 'dramas',
                loadComponent: () => import('./features/catalog/catalog').then(m => m.Catalog)
            },
            {
                path: 'dramas/:id',
                loadComponent: () => import('./features/drama-detail/drama-detail').then(m => m.DramaDetail)
            }
        ]

    }
];
