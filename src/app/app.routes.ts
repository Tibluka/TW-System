import { Routes } from '@angular/router';
import { HomeComponent } from './pages/authorized/home/home.component';
import { authenticationGuard } from './services/guards/authentication.guard';
import { LoginComponent } from './pages/not-authorized/login/login.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: (route) => {
            // Verifica se o usuário está logado no localStorage
            const isLoggedIn = localStorage.getItem('auth_token');
            return isLoggedIn ? 'home' : 'login';
        }
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
