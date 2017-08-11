import { Component, Injector, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { TenantDashboardServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
//import styless from './assets/pages/css/profile.min.css';
@Component({
    //selector: 'workhumapp',
    templateUrl: './workhumapp.component.html',
    
    animations: [appModuleAnimation()]
})
export class WorkhumAppComponent extends AppComponentBase {
    _isNavVisible = true;
    constructor(
        injector: Injector, router:Router
    ) {
        super(injector);
        //router.events.subscribe((path) => {
        //    if (path.toString().indexOf('dashboard') > 0 ) {
        //        this._isNavVisible = false;
        //    }
        //    else {
        //        this._isNavVisible = true;
        //    }
        //});
    }

}