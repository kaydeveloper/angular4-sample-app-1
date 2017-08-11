import { Component, AfterViewInit, Injector, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { NotifyService } from '@abp/notify/notify.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { FlatPermissionWithLevelDto } from '@shared/service-proxies/service-proxies';
import { UserEndorsementModalComponent } from './user-endorsement-modal.component';
//import { ImpersonationService } from './impersonation.service';
import { JTableHelper } from '@shared/helpers/JTableHelper';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import * as moment from "moment";

@Component({
    templateUrl: "./user-endorsement.component.html",
    styleUrls: ["./user-endorsement.component.less"],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class UserEndorsementComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('userEndorsementModal') userEndorsementModal: UserEndorsementModalComponent;

    //Filters
    selectedPermission: string = '';
    private param: string='';
    private _$hashtagTable: JQuery;
    filter: string = '';
    filterText: string = '';

    constructor(
        injector: Injector,
        private _http: Http,
        private _notifyService : NotifyService,
        private _fileDownloadService: FileDownloadService,
        private _activatedRoute: ActivatedRoute,
        private router: Router  
    ) {
        super(injector);
        
                _activatedRoute.params.subscribe(params => {
                    this.param = params['id'];
                });        
    }

    ngAfterViewInit(): void {
        this.userEndorsementModal.show(this.param);        
    }


}