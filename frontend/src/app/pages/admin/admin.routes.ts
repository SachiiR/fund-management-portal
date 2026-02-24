import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
    { path: '', redirectTo: 'view', pathMatch: 'full' },
    {
        path: 'view',
        children: [
            { 
                path: '', 
                loadComponent: () => import('./admin-table/admin-table.component').then(m => m.AdminTableComponent) 
            },
            { 
                path: 'edit/:name', 
                loadComponent: () => import('./admin-edit/admin-edit.component').then(m => m.AdminEditComponent) 
            }
        ]
    }
];