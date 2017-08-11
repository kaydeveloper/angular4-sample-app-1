import { NgModule, APP_INITIALIZER } from '@angular/core';
import * as ngCommon from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { DashboardComponent } from './dashboard/dashboard.component';

import { ModalModule, TabsModule, TooltipModule } from 'ng2-bootstrap';
import { FileUploadModule } from '@node_modules/ng2-file-upload';
import { AbpModule } from '@abp/abp.module';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { ServiceProxyModule } from '@shared/service-proxies/service-proxy.module';
import { AppConsts } from '@shared/AppConsts';
import { UtilsModule } from '@shared/utils/utils.module';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { WorkhumAppComponent } from './workhumapp/workhumapp.component';
import { NavMenuComponent } from './navmenu/navmenu.component';
import { UserProfileAccountComponent } from './userprofile_account/userprofile_account.component';
import { UserProfileComponent } from './userprofile/userprofile.component';
import { DefaultSettingComponent } from './defaultsetting/defaultsetting.component';
import { Error404Component } from './Error404/error404.component';
import { Observable } from 'rxjs/observable';
import { FooterComponent } from './footer/footer.component';
import { ImpersonationService } from './usersfront/impersonation.service';
import { BreadCrumbsComponent } from './breadcrumbs/breadcrumb.component';
import { UsersFrontComponent } from './usersfront/usersfront.component';
import { CreateOrEditUsersFrontModalComponent } from './usersfront/create-or-edit-usersfront-modal.component';
import { CompanyHashtagComponent } from './companyhashtags/companyhashtag.component';
import { CreateOrEditCompanyHashtagModalComponent } from './companyhashtags/create-or-edit-companyhashtag-modal.component';

import { CompanyDepartmentComponent } from './companydepartments/companydepartment.component';
import { CreateOrEditCompanyDepartmentModalComponent } from './companydepartments/create-or-edit-companydepartment-modal.component';

import { OrganizationUnitsDepartmentComponent } from './organization-units-department/organization-units-department.component';
import { OrganizationDepartmentTreeComponent } from './organization-units-department/organization-department-tree.component';
import { OrganizationUnitDepartmentMembersComponent } from './organization-units-department/organization-unit-department-members.component';
import { CreateOrEditUnitDepartmentModalComponent } from './organization-units-department/create-or-edit-unit-department-modal.component';

import { HumCheckComponent } from './humcheck/humcheck.component';
import { HumCheckModalComponent } from './humcheck/humcheck-modal.component';

import { UserEndorsementComponent } from './userendorsement/user-endorsement.component';
import { UserEndorsementModalComponent } from './userendorsement/user-endorsement-modal.component';
import { DashboardService } from './dashboard/dashboard.service';

@NgModule({
    imports: [
        ngCommon.CommonModule,
        FormsModule,
        HttpModule,
        JsonpModule,
        ModalModule,
        AbpModule,
        CommonModule,
        TabsModule.forRoot(),
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        ServiceProxyModule,
        MainRoutingModule,
        ReactiveFormsModule
    ],
    declarations: [
        DashboardComponent,
        WorkhumAppComponent,
        NavMenuComponent,
        UserProfileComponent,
        UserProfileAccountComponent,
        Error404Component,
        FooterComponent,
        BreadCrumbsComponent,
        DefaultSettingComponent,
        UsersFrontComponent,
        CreateOrEditUsersFrontModalComponent,
        CompanyHashtagComponent,
        CreateOrEditCompanyHashtagModalComponent,
        CompanyDepartmentComponent,
        CreateOrEditCompanyDepartmentModalComponent,
        OrganizationUnitsDepartmentComponent,
        OrganizationDepartmentTreeComponent,
        OrganizationUnitDepartmentMembersComponent,
        CreateOrEditUnitDepartmentModalComponent,
        HumCheckComponent,
        HumCheckModalComponent,
        UserEndorsementComponent,
        UserEndorsementModalComponent
    ],
    providers: [ ImpersonationService, DashboardService ]
})
export class MainModule { }