import { Component, AfterViewInit, Injector, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HashTagServiceProxy, HashTagTypeDto, HashTagDto } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { FlatPermissionWithLevelDto } from '@shared/service-proxies/service-proxies';
import { CreateOrEditCompanyHashtagModalComponent } from './create-or-edit-companyhashtag-modal.component';
//import { ImpersonationService } from './impersonation.service';
import { JTableHelper } from '@shared/helpers/JTableHelper';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import * as moment from "moment";

@Component({
    templateUrl: "./companyhashtag.component.html",
    styleUrls: ["./companyhashtag.component.less"],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class CompanyHashtagComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('createOrEditCompanyHashtagModal') createOrEditCompanyHashtagModal: CreateOrEditCompanyHashtagModalComponent;

    //Filters
    selectedPermission: string = '';

    private _$hashtagTable: JQuery;

    hashtag: HashTagDto[] = [];

    hashtagtypes: HashTagTypeDto[] = [];
    filter: string = '';
    filterText: string = '';

    constructor(
        injector: Injector,
        private _http: Http,
        private _hashtagServiceProxy: HashTagServiceProxy,
        private _notifyService : NotifyService,
        private _fileDownloadService: FileDownloadService, 
        //private _impersonationService: ImpersonationService,
        private _activatedRoute : ActivatedRoute
    ) {
        super(injector);
    }
    ngOnInit() {
        console.log('on init');
        this._hashtagServiceProxy.getHashTagType().subscribe(p => { this.hashtagtypes = p.items });
        console.log(this.hashtagtypes.forEach(function (v) { return v.hashTagTypeName; }));
    }

    ngAfterViewInit(): void {
        this._hashtagServiceProxy.getHashTagType().subscribe(p => { this.hashtagtypes = p.items });
        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';

        var initHashtagTable = () => {
            //console.log($('#HashtagTable'));
            this._$hashtagTable = $('#CompanyHashtagTable');            
            this._$hashtagTable.jtable({

                title: this.l('Hashtag'),

                paging: true,
                
                sorting: true,
                multiSorting: true,

                actions: {
                    listAction: (postData, jtParams: JTableParams) => {
                        if (!jtParams.jtSorting) jtParams.jtSorting = 'tagName ASC';
                        return JTableHelper.toJTableListAction(this._hashtagServiceProxy.getHashTag(
                            1, this.filterText, jtParams.jtSorting,
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
                        title: this.l('Actions'),
                        width: '15%',
                        sorting: false,
                        display: (data: JTableFieldOptionDisplayData<HashTagDto>) => {
                            var $span = $('<span></span>');                            

                            if (this.isGranted('Pages.Administration.Hashtag.Create')) {
                                $('<button class="btn btn-default btn-xs" title="' + this.l('Edit') + '"><i class="fa fa-edit"></i></button>')
                                    .appendTo($span)
                                    .click(() => {
                                        this.createOrEditCompanyHashtagModal.show(data.record.id);
                                    });
                            }
                            //if (this.isGranted('Pages.Administration.Hashtag.Create')) {
                            //    $('<button class="btn btn-default btn-xs" title="' + this.l('Delete') + '"><i class="fa fa-trash-o"></i></button>')
                            //        .appendTo($span)
                            //        .click(() => {
                            //            this.deleteHashtag(data.record);
                            //        });
                            //}

                            return $span;
                        }
                    },
                    tagName: {
                        title: this.l('Name'),
                        width: '10%',
                        display: function (data) {
                            var $span = $('<span></span>');
                            console.log('hi its data'+data);
                            $span.append(data.record.tagName + " &nbsp; ");

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
                    hashTagTypesId: {
                        title: this.l('Type'),
                        width: '7%',
                        display: (data: JTableFieldOptionDisplayData<HashTagDto>) => {

                            for (let item of this.hashtagtypes) {

                                if (item.id == data.record.hashTagTypesId) {
                                    return '<span class="label label-success">' + item.hashTagTypeName + '</span>';
                                }
                            };
                        }
                    },
                    isActive: {
                        title: this.l('Active'),
                        width: '6%',
                        display: (data: JTableFieldOptionDisplayData<HashTagDto>) => {

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

            this.getHashtags();
        };

        initHashtagTable();
    }

    getHashtags(): void {
        this._$hashtagTable.jtable('load');
    }

    createHashtag(): void {
        this.createOrEditCompanyHashtagModal.show();
    }

    deleteHashtag(hashtag: HashTagDto): void {
        var self = this;
        self.message.confirm(
            self.l('HashtagDeleteWarningMessage', hashtag.tagName),
            function (isConfirmed) {
                if (isConfirmed) {
                    self._hashtagServiceProxy.deleteHashTag(hashtag.id).subscribe(() => {
                        self.getHashtags();//get all tags again to refresh the grid
                        abp.notify.success(self.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }
}