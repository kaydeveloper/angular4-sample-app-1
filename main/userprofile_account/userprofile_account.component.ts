import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UserServiceProxy, ProfileServiceProxy, UserEditDto, CreateOrUpdateUserInput, UserRoleDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { AbpSessionService } from '@abp/session/abp-session.service';
import { OrganizationUnitHelperServiceProxy, UpdateUserOrganizationUnitInput, OrganizationUnitServiceProxy, ListResultDtoOfOrganizationUnitDto, OrganizationUnitDto, MoveOrganizationUnitInput } from '@shared/service-proxies/service-proxies';
@Component({
    selector: 'user-profile-account',
    templateUrl: './userprofile_account.component.html'
})
export class UserProfileAccountComponent extends AppComponentBase {
    @ViewChild('departmentComboBox') departmentCombobox: ElementRef;
    constructor(
        injector: Injector,
        private sessionService: AbpSessionService,
        private _userService: UserServiceProxy,
        private _organizationUnitHelperService: OrganizationUnitHelperServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _profileService: ProfileServiceProxy
    ) {
        super(injector);
        
        this._userService.getUserForEdit(this.appSession.userId).subscribe(result => {
            this.user = result.user;            
        });
    }
    userdepartmentName: string = 'undefined';
    depName: string = '';
    departmentName: OrganizationUnitDto;
    departments: OrganizationUnitDto[] = [];
    shownLoginName: string = "";
    active: boolean = true;
    saving: boolean = false;
    user: UserEditDto = new UserEditDto();
    updateUserOrganizationUnitInput: UpdateUserOrganizationUnitInput = new UpdateUserOrganizationUnitInput();
    profilePicture: string;
    ngOnInit() {
        this._organizationUnitHelperService.getActiveOrganizationHelperUnits().subscribe(p => { this.departments = p.items; this.departmentdataretrieved(p); });
        this._organizationUnitHelperService.getUserDepartment(this.appSession.userId).subscribe(p => { this.departmentName = p; this.userDepartmentdataretrieved(p); }, err => { console.log(err);});
    }


    departmentdataretrieved(data): void {
        this._activatedRoute.params.subscribe((params: Params) => {
            setTimeout(() => {
                $(this.departmentCombobox).selectpicker("refresh");
                $('[name=department]').selectpicker('refresh');
                console.log('department refreshed');
            }, 0);

        });
    }

    userDepartmentdataretrieved(data): void {

        this.userdepartmentName = data.displayName;
        console.log('from departmentretrieved: '+this.depName);
    }

    onChange(newValue) {

        for (var i = 0; i < this.departments.length; i++)
        {
            if (this.departments[i].id == newValue) {
                console.log('displayName from: ' + this.departments[i].displayName);

                this.userdepartmentName = this.departments[i].displayName;
                console.log('from onChange: ' + this.depName);
            }
        }

        //this.departments.forEach(function (value) {
        //    if (value.id == newValue)
        //    {
        //        console.log('displayName from: ' + value.displayName);
                
        //        this.userdepartmentName = value.displayName;
        //        console.log('from onChange: ' + this.depName);
        //    }
        //});                
    }

    save(): void {
        var input = new CreateOrUpdateUserInput();
        
        input.user = this.user;
        input.user.password = "";
        input.user.phoneNumber = "";
        //console.log(input.user);

        input.setRandomPassword = false;
        input.sendActivationEmail = false;
        
        this.saving = true;
        //---------- update user department ----------------
        this.updateUserOrganizationUnitInput.userId = this.appSession.userId;
        this.updateUserOrganizationUnitInput.organizatinUnitId = parseInt(this.depName);
        console.log('user department set');
        this._organizationUnitHelperService.updateUserDepartment(this.updateUserOrganizationUnitInput).subscribe(p => {
            console.log('bool value is: ' + p);
        });
        //------------------Save user settings--------------
        this._userService.createOrUpdateUserSetting(input)
            .finally(() => { this.saving = false; })
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));               
            });

        

    }
}
