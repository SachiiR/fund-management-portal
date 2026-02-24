import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
    { 
        path: 'view/:name', 
        loadComponent: () => import('./user-view/user-view.component').then(m => m.UserViewComponent) 
    }
];