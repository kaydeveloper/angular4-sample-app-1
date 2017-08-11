import { Component, AfterViewInit, Injector, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ContentTypeServiceProxy, ContentTypeDto, ListResultDtoOfContentTypeDto } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { FlatPermissionWithLevelDto } from '@shared/service-proxies/service-proxies';
import { CreateOrEditContentTypeModalComponent } from './create-or-edit-contenttype-modal.component';
//import { ImpersonationService } from './impersonation.service';
import { JTableHelper } from '@shared/helpers/JTableHelper';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import * as moment from "moment";

@Component({
    templateUrl: "./contenttype.component.html",
    animations: [appModuleAnimation()]
})
export class ContentTypeComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('createOrEditContentTypeModal') createOrEditContentTypeModal: CreateOrEditContentTypeModalComponent;

    //Filters
    selectedPermission: string = '';

    private _$contentTypeTable: JQuery;

    contentType: ContentTypeDto[] = [];
    filter: string = '';
    filterText: string = '';

    constructor(
        injector: Injector,
        private _http: Http,
        private _contenttypeServiceProxy: ContentTypeServiceProxy,
        private _notifyService : NotifyService,
        private _fileDownloadService: FileDownloadService, 
        //private _impersonationService: ImpersonationService,
        private _activatedRoute : ActivatedRoute
    ) {
        super(injector);
    }


    ngAfterViewInit(): void {

        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';

        var initContentTypeTable = () => {
            //console.log($('#ContentTypeTable'));
            this._$contentTypeTable = $('#ContentTypeTable');            
            this._$contentTypeTable.jtable({

                title: this.l('ContentType'),

                paging: true,
                sorting: true,
                multiSorting: true,

                actions: {
                    listAction: (postData, jtParams: JTableParams) => {
                        return JTableHelper.toJTableListAction(this._contenttypeServiceProxy.getContentType(
                            1,this.filterText,                            
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
                        display: (data: JTableFieldOptionDisplayData<ContentTypeDto>) => {
                            var $span = $('<span></span>');                            

                            if (this.isGranted('Pages.Administration.ContentType.Create')) {
                                $('<button class="btn btn-default btn-xs" title="' + this.l('Edit') + '"><i class="fa fa-edit"></i></button>')
                                    .appendTo($span)
                                    .click(() => {
                                        this.createOrEditContentTypeModal.show(data.record.id);
                                    });
                            }
                            if (this.isGranted('Pages.Administration.ContentType.Create')) {
                                $('<button class="btn btn-default btn-xs" title="' + this.l('Delete') + '"><i class="fa fa-trash-o"></i></button>')
                                    .appendTo($span)
                                    .click(() => {
                                        this.deleteContentType(data.record);
                                    });
                            }

                            return $span;
                        }
                    },
                    contentTypeName: {
                        title: this.l('Name'),
                        width: '10%',
                        display: function (data) {
                            var $span = $('<span></span>');
                            console.log('hi its data' + data);
                            $span.append(data.record.contentTypeName + " &nbsp; ");

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
                    creationTime: {
                        title: this.l('CreationTime'),
                        width: '7%',
                        display: (data: JTableFieldOptionDisplayData<ContentTypeDto>) => moment(data.record.creationTime).format('L')
                    }
                }
            });

            this.getContentTypes();
        };

        initContentTypeTable();
    }

    getContentTypes(): void {
        this._$contentTypeTable.jtable('load');
    }

    createContentType(): void {
        this.createOrEditContentTypeModal.show();
    }

    deleteContentType(contenttype: ContentTypeDto): void {
        var self = this;
        self.message.confirm(
            self.l('ContentTypeDeleteWarningMessage', contenttype.contentTypeName),
            function (isConfirmed) {
                if (isConfirmed) {
                    self._contenttypeServiceProxy.updateContentType(contenttype).subscribe(() => {
                        self.getContentTypes();//get all tags again to refresh the grid
                        abp.notify.success(self.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }
}