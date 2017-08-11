import { Component, Injector } from '@angular/core';
import { SideBarMenu } from './side-bar-menu';
import { SideBarMenuItem } from './side-bar-menu-item';

import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    templateUrl: './side-bar.component.html',
    selector: 'side-bar'
})
export class SideBarComponent extends AppComponentBase {

    constructor(injector: Injector, public permission: PermissionCheckerService) {
        super(injector);
    }
    
    menu: SideBarMenu = new SideBarMenu("MainMenu", "MainMenu", [
        new SideBarMenuItem("Dashboard", "Pages.Tenant.Dashboard", "icon-home", "/app/main/dashboard"),
        new SideBarMenuItem("Profile", "Pages.Tenant.Dashboard", "icon-home", "/app/main/user-profile"),
        new SideBarMenuItem("Tenants", "Pages.Tenants", "icon-globe", "/app/admin/tenants"),
        new SideBarMenuItem("Editions", "Pages.Editions", "icon-grid", "/app/admin/editions"),
        new SideBarMenuItem("Industries", "Pages.Industries", "icon-wrench", "/app/admin/industries"),
        new SideBarMenuItem("Administration", "", "icon-wrench", "", [
            new SideBarMenuItem("OrganizationUnits", "Pages.Administration.OrganizationUnits", "icon-layers", "/app/admin/organization-units"),
            new SideBarMenuItem("Roles", "Pages.Administration.Roles", "icon-briefcase", "/app/admin/roles"),
            new SideBarMenuItem("Users", "Pages.Administration.Users", "icon-people", "/app/admin/users"),
            new SideBarMenuItem("Languages", "Pages.Administration.Languages", "icon-flag", "/app/admin/languages"),
            new SideBarMenuItem("AuditLogs", "Pages.Administration.AuditLogs", "icon-lock", "/app/admin/auditLogs"),
            new SideBarMenuItem("Maintenance", "Pages.Administration.Host.Maintenance", "icon-wrench", "/app/admin/maintenance"),
            new SideBarMenuItem("Settings", "Pages.Administration.Host.Settings", "icon-settings", "/app/admin/hostSettings"),
            new SideBarMenuItem("Settings", "Pages.Administration.Tenant.Settings", "icon-settings", "/app/admin/tenantSettings"),
            new SideBarMenuItem("Hashtag", "Pages.Administration.Tenant.Hashtags", "icon-tag", "/app/admin/hashtags"),
            new SideBarMenuItem("ContentType", "Pages.Administration.Tenant.ContentType", "icon-tag", "/app/admin/content-type"),
            new SideBarMenuItem("HashtagType", "Pages.Administration.Tenant.HashTagType", "icon-tag", "/app/admin/hashtag-type")
        ]),
        
    ]);

    checkChildMenuItemPermission(menuItem): boolean {

        for (var i = 0; i < menuItem.items.length; i++) {
            var subMenuItem = menuItem.items[i];

            if (subMenuItem.permissionName && this.permission.isGranted(subMenuItem.permissionName)) {
                return true;
            }
            
            if (subMenuItem.items && subMenuItem.items.length) {
                return this.checkChildMenuItemPermission(subMenuItem);
            } else if (!subMenuItem.permissionName) {
                return true;
            }
        }

        return false;
    }

    showMenuItem(menuItem): boolean {
        if (menuItem.permissionName) {
            return this.permission.isGranted(menuItem.permissionName);
        }

        if (menuItem.items && menuItem.items.length) {
            return this.checkChildMenuItemPermission(menuItem);
        }

        return true;
    }

}