import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./app/components/auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./app/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'barbearias',
        children: [
            {
                path: '',
                loadComponent: () => import('./app/components/barbearias/list/barbearia-list.component').then(m => m.BarbeariaListComponent)
            }
        ]
    },
    {
        path: 'home',
        loadComponent: () => import('./app.component').then(m => m.AppComponent)
    },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];
