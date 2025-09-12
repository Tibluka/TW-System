import { Routes } from '@angular/router';
import { authenticationGuard } from './services/guards/authentication.guard';
import { LoginComponent } from './pages/not-authorized/login/login.component';
import { SignupComponent } from './pages/not-authorized/signup/signup.component';
import { HomeComponent } from './pages/authorized/home/home.component';
import { ProductionOrdersComponent } from './pages/authorized/production-orders/production-orders.component';
import { ProductionReceiptComponent } from './pages/authorized/production-receipt/production-receipt.component';
import { AuthorizedComponent } from './pages/authorized/authorized.component';
import { DevelopmentsComponent } from './pages/authorized/developments/developments.component';
import { ProductionSheetsComponent } from './pages/authorized/production-sheets/production-sheets.component';

export const routes: Routes = [
    // Rota raiz redireciona para login
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },

    // Rotas não autorizadas (sem menu)
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },

    // Rotas autorizadas (com menu através do layout)
    {
        path: 'authorized',
        component: AuthorizedComponent,
        canActivate: [authenticationGuard],
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                component: HomeComponent
            },
            {
                path: 'developments',
                component: DevelopmentsComponent
            },
            {
                path: 'production-orders',
                component: ProductionOrdersComponent
            },
            {
                path: 'production-sheets',
                component: ProductionSheetsComponent
            },
            {
                path: 'production-receipt',
                component: ProductionReceiptComponent
            }
        ]
    },
]