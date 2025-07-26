import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/welcome',
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
        path: '',
        loadComponent: () => import('./app/components/layout/layout-wrapper.component').then(m => m.LayoutWrapperComponent),
        children: [
            {
                path: 'welcome',
                loadComponent: () => import('./app/components/welcome/welcome.component').then(m => m.WelcomeComponent)
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
                    },
                    {
                        path: 'nova',
                        loadComponent: () => import('./app/components/barbearias/form/barbearia-form.component').then(m => m.BarbeariaFormComponent)
                    },
                    {
                        path: 'editar/:id',
                        loadComponent: () => import('./app/components/barbearias/form/barbearia-form.component').then(m => m.BarbeariaFormComponent)
                    }
                ]
            }
        ]
    },

    {
        path: '**',
        redirectTo: '/welcome'
    }
];
