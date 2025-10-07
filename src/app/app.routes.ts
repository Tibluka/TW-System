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
import { RedirectComponent } from './pages/authorized/redirect/redirect.component';
import { authenticationGuard } from './shared/services/guards/authentication.guard';
import { permissionsGuard } from './shared/services/guards/permissions.guard';
import { Permission } from './models/permissions/permissions';

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
                component: RedirectComponent
            },
            {
                path: 'clients',
                component: ClientsComponent,
                canActivate: [permissionsGuard(Permission.VIEW_CLIENTS)]
            },
            {
                path: 'developments',
                component: DevelopmentsComponent,
                canActivate: [permissionsGuard(Permission.VIEW_DEVELOPMENTS)]
            },
            {
                path: 'production-orders',
                component: ProductionOrdersComponent,
                canActivate: [permissionsGuard(Permission.VIEW_PRODUCTION_ORDERS)]
            },
            {
                path: 'production-sheets',
                component: ProductionSheetsComponent,
                canActivate: [permissionsGuard(Permission.VIEW_PRODUCTION_SHEETS)]
            },
            {
                path: 'production-receipt',
                component: ProductionReceiptComponent,
                canActivate: [permissionsGuard(Permission.VIEW_PRODUCTION_RECEIPTS)]
            },
            {
                path: 'delivery-sheets',
                component: DeliverySheetsComponent,
                canActivate: [permissionsGuard(Permission.VIEW_DELIVERY_SHEETS)]
            }
        ]
    },
]
