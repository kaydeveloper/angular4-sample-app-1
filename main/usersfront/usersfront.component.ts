import { Component, AfterViewInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { UserServiceProxy, UserListDto, EntityDtoOfInt64 } from '@shared/service-proxies/service-proxies';
import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { NotifyService } from '@abp/notify/notify.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { FlatPermissionWithLevelDto, TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditUsersFrontModalComponent } from './create-or-edit-usersfront-modal.component';
import { ImpersonationService } from './impersonation.service';
import { JTableHelper } from '@shared/helpers/JTableHelper';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import * as moment from "moment";

@Component({
    templateUrl: "./usersfront.component.html",
    styleUrls: ["./usersfront.component.less"],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class UsersFrontComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('createOrEditUsersFrontModal') createOrEditUserModal: CreateOrEditUsersFrontModalComponent;

    //Filters
    advancedFiltersAreShown: boolean = false;
    filterText: string = '';
    selectedPermission: string = '';
    role: number = undefined;

    private _$usersTable: JQuery;

    constructor(
        injector: Injector,
        private _http: Http,
        private _userServiceProxy: UserServiceProxy,
        private _notifyService: NotifyService,
        private _fileDownloadService: FileDownloadService,
        private _impersonationService: ImpersonationService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute
    ) {
        super(injector);
    }

    ngAfterViewInit(): void {

        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';
        console.log(this.filterText);
        var initUsersTable = () => {
            this._$usersTable = $('#UsersFrontTable');

            this._$usersTable.jtable({

                title: this.l('Users'),

                paging: true,
                sorting: true,
                multiSorting: true,

                actions: {
                    listAction: (postData, jtParams: JTableParams) => {
                        return JTableHelper.toJTableListAction(this._userServiceProxy.getUsers(
                            this.filterText,
                            this.permission ? this.selectedPermission : undefined,
                            this.role,
                            jtParams.jtSorting,
                            jtParams.jtPageSize,
                            jtParams.jtStartIndex
                        ));
                    }
                },

                fields: {
                    id: {
                        key: true,
                        list: false
                    },
                    actions: {
                        title: 'Edit',
                        width: '15%',
                        sorting: true,
                        display: (data: JTableFieldOptionDisplayData<UserListDto>) => {
                            var $span = $('<span></span>');

                            //if (this.isGranted('Pages.Administration.Users.Impersonation') && data.record.id !== this.appSession.userId) {
                            //    $('<button class="btn btn-default btn-xs" title="' + this.l('LoginAsThisUser') + '"><i class="fa fa-sign-in"></i></button>')
                            //        .appendTo($span)
                            //        .click(() => {
                            //            this._impersonationService.impersonate(data.record.id, this.appSession.tenantId);
                            //        });
                            //}

                            if (this.isGranted('Pages.Administration.Users.Edit')) {
                                $('<button class="btn btn-default btn-xs" title="' + this.l('Edit') + '"><i class="fa fa-edit"></i></button>')
                                    .appendTo($span)
                                    .click(() => {
                                        this.createOrEditUserModal.show(data.record.id);
                                    });
                            }

                            //if (this.isGranted('Pages.Administration.Users.ChangePermissions')) {
                            //    $('<button class="btn btn-default btn-xs" title="' + this.l('Permissions') + '"><i class="fa fa-list"></i></button>')
                            //        .appendTo($span)
                            //        .click(() => {
                            //            this.editUserPermissionsModal.show(data.record.id, data.record.userName);
                            //        });
                            //}

                            //$('<button class="btn btn-default btn-xs" title="' + this.l('Unlock') + '"><i class="fa fa-unlock"></i></button>')
                            //    .appendTo($span)
                            //    .click(() => {
                            //        this._userServiceProxy.unlockUser(new EntityDtoOfInt64({ id: data.record.id })).subscribe(() => {
                            //            this.notify.success(this.l('UnlockedTheUser', data.record.userName));
                            //        });
                            //    });

                            //if (this.isGranted('Pages.Administration.Users.Delete')) {
                            //    $('<button class="btn btn-default btn-xs" title="' + this.l('Delete') + '"><i class="fa fa-trash-o"></i></button>')
                            //        .appendTo($span)
                            //        .click(() => {
                            //            this.deleteUser(data.record);
                            //        });
                            //}

                            return $span;
                        }
                    },
                    name: {
                        title: 'First Name',
                        width: '10%'
                    },
                    surname: {
                        title: 'Last Name',
                        width: '10%'
                    },
                    
                    emailAddress: {
                        title: this.l('EmailAddress'),
                        width: '15%'
                    },
                    username: {
                        title: 'Department',
                        width: '15%'
                    },
                    isActive: {
                        title: this.l('Active'),
                        width: '6%',
                        display: (data: JTableFieldOptionDisplayData<UserListDto>) => {
                            if (data.record.isActive) {
                                return '<span class="label label-success">' + this.l('Yes') + '</span>';
                            } else {
                                return '<span class="label label-default">' + this.l('No') + '</span>';
                            }
                        }
                    }
                }
            });

            this.getUsers();
        };

        initUsersTable();
    }

    getUsers(): void {
        this._$usersTable.jtable('load');
    }

    exportToExcel(): void {
        this._userServiceProxy.getUsersToExcel()
            .subscribe(result => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    createUser(): void {
        this.createOrEditUserModal.show();
    }

    deleteUser(user: UserListDto): void {
        if (user.userName === AppConsts.userManagement.defaultAdminUserName) {
            this.message.warn(this.l("{0}UserCannotBeDeleted", AppConsts.userManagement.defaultAdminUserName));
            return;
        }

        this.message.confirm(
            this.l('UserDeleteWarningMessage', user.userName),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._userServiceProxy.deleteUser(user.id)
                        .subscribe(() => {
                            this.getUsers();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }
}