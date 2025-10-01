import { Routes } from '@angular/router';
import { LoginComponent } from './pages/not-authorized/login/login.component';
import { SignupComponent } from './pages/not-authorized/signup/signup.component';

import { AuthorizedComponent } from './pages/authorized/authorized.component';
import { ClientsComponent } from './pages/authorized/clients/clients.component';
import { DevelopmentsComponent } from './pages/authorized/developments/developments.component';
import { ProductionOrdersComponent } from './pages/authorized/production-orders/production-orders.component';
import { ProductionReceiptComponent } from './pages/authorized/production-receipt/production-receipt.component';
import { ProductionSheetsComponent } from './pages/authorized/production-sheets/production-sheets.component';
import { DeliverySheetsComponent } from './pages/authorized/delivery-sheets/delivery-sheets.component';
import { authenticationGuard } from './shared/services/guards/authentication.guard';

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
        path: 'signup',
        component: SignupComponent
    },


    {
        path: 'authorized',
        component: AuthorizedComponent,
        canActivate: [authenticationGuard],
        children: [
            {
                path: '',
                redirectTo: 'clients',
                pathMatch: 'full'
            },
            {
                path: 'clients',
                component: ClientsComponent
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
            },
            {
                path: 'delivery-sheets',
                component: DeliverySheetsComponent
            }
        ]
    },
]
