import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'admin', pathMatch: 'full' },
    {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: 'user',
        loadChildren: () => import('./pages/user/user.routes').then(m => m.USER_ROUTES)
    },
    { path: '**', redirectTo: 'admin' }
];