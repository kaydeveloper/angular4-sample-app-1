import { OnInit, Injector, Component } from '@angular/core';
import {
    HumCycleServiceProxy, OrganizationUnitHelperServiceProxy,
    HumCycleDto, OrganizationUnitDto
} from '@shared/service-proxies/service-proxies';
import { AppSessionService } from '../../../shared/common/session/app-session.service';

@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styles: ['./navmenu.component.css']
})
export class NavMenuComponent {
    public appSession: AppSessionService;
    public humCycle: HumCycleDto;
    public organizationUnit: OrganizationUnitDto;
    public orgUnitId: number;
    public humCycleId: number;

    constructor(
        private _humCycleService: HumCycleServiceProxy,
        private _organizationUnitService: OrganizationUnitHelperServiceProxy,
        injector: Injector) 
    {
        this.appSession = injector.get(AppSessionService);
    }

    ngOnInit() {
        //this.appSession.init();
        
            this._humCycleService.getLatestHumCycle().toPromise().then(
                result => {
                    this.humCycle = result.toJS()
                    this.humCycleId = this.humCycle.id == null ? 0 : this.humCycle.id;
            });

            this._organizationUnitService.getOrganizationUnitByUserId(this.appSession.user.id).toPromise().then(
                result => {
                    this.organizationUnit = result.toJS();
                    this.orgUnitId = this.organizationUnit.id == null ? 0 : this.organizationUnit.id;
                });
    }
}
