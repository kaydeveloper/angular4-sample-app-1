import { Component, AfterViewInit, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { IndustryServiceProxy, IndustryListDto } from '@shared/service-proxies/service-proxies';
import { JTableHelper } from '@shared/helpers/JTableHelper';
import { CreateOrEditIndustryModalComponent } from './create-or-edit-industry-modal.component';

import * as moment from "moment";

@Component({
    templateUrl: "./industries.component.html",
    styleUrls: ["./industries.component.less"],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class IndustriesComponent extends AppComponentBase implements AfterViewInit {
    @ViewChild('createOrEditIndustryModal') createOrEditIndustryModal: CreateOrEditIndustryModalComponent;

    private _$industriesTable: JQuery;
    filterText: string;

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _industryService: IndustryServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewInit(): void {
        let self = this;

        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';

        var initIndustriesTable = () => {
            self._$industriesTable = $('#IndustriesTable');

            self._$industriesTable.jtable({

                title: self.l('Industries'),

                paging: true,
                sorting: true,
                multiSorting: true,

                actions: {
                    listAction(postData, jtParams: JTableParams) {
                        return JTableHelper.toJTableListAction(
                            self._industryService.getIndustries(
                                self.filterText,
                                jtParams.jtSorting,
                                jtParams.jtPageSize,
                                jtParams.jtStartIndex
                            )
                        );
                    }
                },

                fields: {
                    id: {
                        key: true,
                        list: false
                    },
                    actions: {
                        title: self.l('Actions'),
                        width: '15%',
                        sorting: false,
                        list: self.permission.isGranted('Pages.Industries.Edit') || self.permission.isGranted('Pages.Industries.Delete'),
                        display: (data: JTableFieldOptionDisplayData<IndustryListDto>) => {
                            var $span = $('<span></span>');

                            if (self.permission.isGranted("Pages.Industries.Edit")) {
                                $('<button class="btn btn-default btn-xs" title="' + self.l('Edit') + '"><i class="fa fa-edit"></i></button>')
                                    .appendTo($span)
                                    .click(() => {
                                        self.createOrEditIndustryModal.show(data.record.id);
                                    });
                            }
                            
                            if (self.permission.isGranted("Pages.Industries.Delete")) {
                                $('<button class="btn btn-default btn-xs" title="' + self.l('Delete') + '"><i class="fa fa-trash-o"></i></button>')
                                    .appendTo($span)
                                    .click(() => {
                                        self.deleteIndustry(data.record);
                                    });
                            }

                            return $span;
                        }
                    },
                    name: {
                        title: self.l('Name'),
                        width: '20%'
                    },
                    displayName: {
                        title: self.l('DisplayName'),
                        width: '30%'
                    },
                    isActive: {
                        title: self.l('Active'),
                        width: '15%',
                        display: data => {
                            if (data.record.isActive) {
                                return '<span class="label label-success">' + self.l('Yes') + '</span>';
                            } else {
                                return '<span class="label label-default">' + self.l('No') + '</span>';
                            }
                        }
                    },
                    lastModificationTime: {
                        title: self.l('LastModificationTime'),
                        width: '20%',
                        display(data) {
                            return moment(data.record.creationTime).format('L');
                        }
                    }
                }

            });

            self.getIndustries();
        };

        initIndustriesTable();
    }

    getIndustries(): void {
        this._$industriesTable.jtable('load');
    }

    createIndustry(): void {
        let self = this;
        self.createOrEditIndustryModal.show();
    }

    deleteIndustry(industry: IndustryListDto): void {
        let self = this;
        self.message.confirm(
            self.l('IndustryDeleteWarningMessage', industry.displayName),
            function (isConfirmed) {
                if (isConfirmed) {
                    self._industryService.deleteIndustry(industry.id).subscribe((resul) => {
                        self.getIndustries();
                        self.notify.success(self.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }
}