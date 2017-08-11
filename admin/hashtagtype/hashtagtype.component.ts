import { Component, AfterViewInit, Injector, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HashTagTypeServiceProxy, HashTagTypeDto, ListResultDtoOfHashTagTypeDto } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { FlatPermissionWithLevelDto } from '@shared/service-proxies/service-proxies';
import { CreateOrEditHashtagTypeModalComponent } from './create-or-edit-hashtagtype-modal.component';
//import { ImpersonationService } from './impersonation.service';
import { JTableHelper } from '@shared/helpers/JTableHelper';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import * as moment from "moment";

@Component({
    templateUrl: "./hashtagtype.component.html",
    styleUrls: ["./hashtagtype.component.less"],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class HashtagTypeComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('createOrEditHashtagTypeModal') createOrEditHashtagTypeModal: CreateOrEditHashtagTypeModalComponent;

    //Filters
    selectedPermission: string = '';

    private _$hashtagtypeTable: JQuery;

    hashtagtype: HashTagTypeDto[] = [];
    filter: string = '';
    filterText: string = '';

    constructor(
        injector: Injector,
        private _http: Http,
        private _hashtagTypeServiceProxy: HashTagTypeServiceProxy,
        private _notifyService : NotifyService,
        private _fileDownloadService: FileDownloadService, 
        //private _impersonationService: ImpersonationService,
        private _activatedRoute : ActivatedRoute
    ) {
        super(injector);
    }


    ngAfterViewInit(): void {

        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';

        var initHashtagTypeTable = () => {
            //console.log($('#HashtagTable'));
            this._$hashtagtypeTable = $('#HashtagTypeTable');            
            this._$hashtagtypeTable.jtable({

                title: this.l('HashtagType'),

                paging: true,
                sorting: true,
                multiSorting: true,

                actions: {
                    listAction: (postData, jtParams: JTableParams) => {
                        return JTableHelper.toJTableListAction(this._hashtagTypeServiceProxy.getHashTagType(1,''));
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
                        display: (data: JTableFieldOptionDisplayData<HashTagTypeDto>) => {
                            var $span = $('<span></span>');                            

                            if (this.isGranted('Pages.Administration.HashTagType.Create')) {
                                $('<button class="btn btn-default btn-xs" title="' + this.l('Edit') + '"><i class="fa fa-edit"></i></button>')
                                    .appendTo($span)
                                    .click(() => {
                                        this.createOrEditHashtagTypeModal.show(data.record.id);
                                    });
                            }
                            if (this.isGranted('Pages.Administration.HashTagType.Create')) {
                                $('<button class="btn btn-default btn-xs" title="' + this.l('Delete') + '"><i class="fa fa-trash-o"></i></button>')
                                    .appendTo($span)
                                    .click(() => {
                                        this.deleteHashtagType(data.record);
                                    });
                            }

                            return $span;
                        }
                    },
                    hashTagTypeName: {
                        title: this.l('Name'),
                        width: '10%',
                        display: function (data) {
                            var $span = $('<span></span>');
                            console.log('hi its data'+data);
                            $span.append(data.record.hashTagTypeName + " &nbsp; ");

                            if (data.record.isStatic) {
                                $span.append('<span class="label label-info" data-toggle="tooltip" title="' + this.l('StaticHashTagType_Tooltip') + '" data-placement="top">' + this.l('Static') + '</span>&nbsp;');
                            }

                            if (data.record.isDefault) {
                                $span.append('<span class="label label-default" data-toggle="tooltip" title="' + this.l('DefaultHashTagType_Description') + '" data-placement="top">' + this.l('Default') + '</span>&nbsp;');
                            }
                            $span.find('[data-toggle=tooltip]').tooltip();
                            return $span;
                        }

                    }
                }
            });

            this.getHashtagTypes();
        };

        initHashtagTypeTable();
    }

    getHashtagTypes(): void {
        this._$hashtagtypeTable.jtable('load');
    }

    createHashtagType(): void {
        this.createOrEditHashtagTypeModal.show();
    }

    deleteHashtagType(hashtagtype: HashTagTypeDto): void {
        //var self = this;
        //self.message.confirm(
        //    self.l('HashtagTypeDeleteWarningMessage', hashtagtype.hashTagTypeName),
        //    function (isConfirmed) {
        //        if (isConfirmed) {
        //            self._hashtagTypeServiceProxy.updateHashTagType(hashtagtype).subscribe(() => {
        //                self.getHashtagTypes();//get all tags again to refresh the grid
        //                abp.notify.success(self.l('SuccessfullyDeleted'));
        //            });
        //        }
        //    }
        //);
    }
}