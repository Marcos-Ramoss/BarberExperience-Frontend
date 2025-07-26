import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./app.component').then(m => m.AppComponent)
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];
