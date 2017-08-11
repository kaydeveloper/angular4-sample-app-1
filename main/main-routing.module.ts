import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

import { WorkhumAppComponent } from './workhumapp/workhumapp.component';
import { NavMenuComponent } from './navmenu/navmenu.component';
import { UserProfileAccountComponent } from './userprofile_account/userprofile_account.component';
import { UserProfileComponent } from './userprofile/userprofile.component';
import { DefaultSettingComponent } from './defaultsetting/defaultsetting.component';
import { Error404Component } from './Error404/error404.component';
import { Observable } from 'rxjs/observable';
import { FooterComponent } from './footer/footer.component';
import { BreadCrumbsComponent } from './breadcrumbs/breadcrumb.component';
import { UsersFrontComponent } from './usersfront/usersfront.component';
import { CompanyHashtagComponent } from './companyhashtags/companyhashtag.component';
import { CompanyDepartmentComponent } from './companydepartments/companydepartment.component';
import { OrganizationUnitsDepartmentComponent } from './organization-units-department/organization-units-department.component';
import { HumCheckComponent } from './humcheck/humcheck.component';
import { UserEndorsementComponent } from './userendorsement/user-endorsement.component';
//import { ReportsComponent } from '../reports/reports.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: WorkhumAppComponent,
                children: [
                    { path: 'dashboard', component: DashboardComponent, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: 'user-profile-account', component: UserProfileAccountComponent },
                    { path: 'user-profile', component: UserProfileComponent },
                    { path: 'usersfront', component: UsersFrontComponent },
                    { path: 'company-hashtag', component: CompanyHashtagComponent },
                    { path: 'company-department', component: CompanyDepartmentComponent },
                    { path: 'error-404', component: Error404Component },
                    { path: 'default-setting', component: DefaultSettingComponent },
                    { path: 'hum-check/:id', component: HumCheckComponent },
                    { path: 'user-endorsement/:id', component: UserEndorsementComponent },
                    //{ path: 'reports/:humCycleId/:organizationUnitId', component: ReportsComponent },
                    { path: '**', redirectTo: 'error-404' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class MainRoutingModule { }