import { Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { OrganizationUnitDepartmentMembersComponent } from './organization-unit-department-members.component';
import { OrganizationDepartmentTreeComponent } from './organization-department-tree.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
    templateUrl: "./organization-units-department.component.html",
    animations: [appModuleAnimation()]
})
export class OrganizationUnitsDepartmentComponent extends AppComponentBase {

    @ViewChild('ouMembers') ouMembers: OrganizationUnitDepartmentMembersComponent;
    @ViewChild('ouTree') ouTree: OrganizationDepartmentTreeComponent;

    constructor(
        injector: Injector
    ) {
        super(injector);
    }
}