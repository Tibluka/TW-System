import { Routes } from '@angular/router';
import { HomeComponent } from './pages/authorized/home/home.component';
import { authenticationGuard } from './services/guards/authentication.guard';
import { LoginComponent } from './pages/not-authorized/login/login.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [authenticationGuard]
    }
];
