import { Component, AfterViewInit, Injector, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { NotifyService } from '@abp/notify/notify.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { FlatPermissionWithLevelDto } from '@shared/service-proxies/service-proxies';
import { CreateOrEditCompanyDepartmentModalComponent } from './create-or-edit-companydepartment-modal.component';
//import { ImpersonationService } from './impersonation.service';
import { JTableHelper } from '@shared/helpers/JTableHelper';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { OrganizationUnitHelperServiceProxy, OrganizationUnitServiceProxy, ListResultDtoOfOrganizationUnitDto, OrganizationUnitDto, MoveOrganizationUnitInput } from '@shared/service-proxies/service-proxies';

import * as moment from "moment";
import { IOrganizationUnitDepartmentOnEdit } from './create-or-edit-companydepartment-modal.component';
@Component({
    templateUrl: "./companydepartment.component.html",
    styleUrls: ["./companydepartment.component.less"],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class CompanyDepartmentComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('createOrEditCompanyDepartmentModal') createOrEditCompanyDepartmentModal: CreateOrEditCompanyDepartmentModalComponent;
    orgUnit: IOrganizationUnitDepartmentOnEdit;
    //Filters
    selectedPermission: string = '';
    orgunit: IOrganizationUnitDepartmentOnEdit = {};
    private _$departmentTable: JQuery;
    parentId?: number;
    //department: DepartmentDto[] = [];
    filter: string = '';
    filterText: string = '';
    OUDto: ListResultDtoOfOrganizationUnitDto;
    constructor(
        injector: Injector,
        private _http: Http,
        private _organizationUnitService: OrganizationUnitServiceProxy,
        private _organizationUnitHelperService: OrganizationUnitHelperServiceProxy,
        private _notifyService : NotifyService,
        private _fileDownloadService: FileDownloadService, 
        //private _impersonationService: ImpersonationService,
        private _activatedRoute : ActivatedRoute
    ) {
        super(injector);
    }


    ngAfterViewInit(): void {

        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';
        console.log('get department called');
        var initDepartmentTable = () => {
            //console.log($('#DepartmentTable'));
            this._$departmentTable = $('#CompanyDepartmentTable');            
            this._$departmentTable.jtable({

                title: this.l('Department'),

                paging: true,
                sorting: true,
                multiSorting: true,
                actions: {
                    listAction: (postData, jtParams: JTableParams) => {
                        if (!jtParams.jtSorting) jtParams.jtSorting = 'displayName ASC';
                        return JTableHelper.toJTableListAction(this._organizationUnitHelperService.getOrganizationHelperUnits(
                            1, this.filterText, jtParams.jtSorting, jtParams.jtPageSize, jtParams.jtStartIndex
                        ));
                    }
                },

                fields: {
                    id: {
                        key: true,
                        list: false
                    },
                    actions: {
                        title: this.l('Actions'),
                        width: '15%',
                        sorting: false,
                        display: (data: JTableFieldOptionDisplayData<OrganizationUnitDto>) => {
                            var $span = $('<span></span>');

                            if (this.isGranted('Pages.Administration.Hashtag.Create')) {
                                $('<button class="btn btn-default btn-xs" title="' + this.l('Edit') + '"><i class="fa fa-edit"></i></button>')
                                    .appendTo($span)
                                    .click(() => {
                                        this.createOrEditCompanyDepartmentModal.show(data.record);
                                    });
                            }                            

                            return $span;
                        }
                    },
                    displayName: {
                        title: this.l('Name'),
                        width: '10%',
                        display: function (data) {
                            var $span = $('<span></span>');
                            $span.append(data.record.displayName + " &nbsp; ");

                            if (data.record.isStatic) {
                                $span.append('<span class="label label-info" data-toggle="tooltip" title="' + this.l('StaticHashTag_Tooltip') + '" data-placement="top">' + this.l('Static') + '</span>&nbsp;');
                            }

                            if (data.record.isDefault) {
                                $span.append('<span class="label label-default" data-toggle="tooltip" title="' + this.l('DefaultHashTag_Description') + '" data-placement="top">' + this.l('Default') + '</span>&nbsp;');
                            }
                            $span.find('[data-toggle=tooltip]').tooltip();
                            return $span;
                        }

                    },
                    isActive: {
                        title: this.l('Active'),
                        width: '6%',
                        display: (data: JTableFieldOptionDisplayData<OrganizationUnitDto>) => {

                            if (data.record.isActive) {
                                return '<span class="label label-success">' + this.l('Yes') + '</span>';
                            }
                            else {
                                return '<span class="label label-success">' + this.l('No') + '</span>';
                            }
                        }
                    }
                }
            });

            this.getDepartments();
        };

        initDepartmentTable();
    }

    getDepartments(): void {
        console.log('filter text: ' + this.filterText);
        this._$departmentTable.jtable('load');
    }

    createDepartment(): void {
        this.createOrEditCompanyDepartmentModal.show(this.orgunit);
    }

    deleteDepartment(department: OrganizationUnitDto): void {
        var self = this;
        //self.message.confirm(
        //    self.l('DepartmentDeleteWarningMessage', department.Name),
        //    function (isConfirmed) {
        //        if (isConfirmed) {
        //            self._departmentServiceProxy.updateDepartment(department).subscribe(() => {
        //                self.getDepartments();//get all tags again to refresh the grid
        //                abp.notify.success(self.l('SuccessfullyDeleted'));
        //            });
        //        }
        //    }
        //);
    }
}