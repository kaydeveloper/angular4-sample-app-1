import { AppComponentBase } from '../../shared/common/app-component-base';
import { Component, Injector, OnInit, AfterViewInit, ViewChild, SimpleChanges, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ReportsService } from './reports.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { PDFGeneratorService } from '@shared/common/pdf/pdf-generator.service'
import { AppConsts } from '@shared/AppConsts';
import {
    HumCycleServiceProxy, HumScoreServiceProxy, UserServiceProxy, UserHashTagServiceProxy, UserEndorsementServiceProxy, OrganizationUnitHelperServiceProxy, ProfileServiceProxy,
    HumCycleDto, HumScoreDto, UserDetailCountOutput, GetUserHashTagDto, UserEndorsementDto, GetUserOrganizationUnitsByTenantIdOutput, GetUserEndorsementWithOrgIdDto, GetUserHashTagWithOrgIdDto,
    ListResultDtoOfGetUserEndorsementWithOrgIdDto, ListResultDtoOfGetUserHashTagWithOrgIdDto
} from '@shared/service-proxies/service-proxies';
import { ChartsModule, Color, BaseChartDirective } from 'ng2-charts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from "lodash";
import * as moment from "moment";
let jsPDF = require('jspdf');
let html2canvas = require('html2canvas');

@Component({
    selector: 'reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.less'],
    animations: [appModuleAnimation()]
})

export class ReportsComponent extends AppComponentBase implements OnInit, AfterViewInit {
    saving: boolean = false;
    datas = [];
    datas1 = [];
    datas2 = [];
    sub: any;
    humCycleId: number;
    organizationUnitId: number;

    //web api variables
    public humCycle: HumCycleDto = new HumCycleDto();
    public humScore: HumScoreDto = new HumScoreDto();
    public humScoreList: HumScoreDto[] = [];
    public userDetailCount: UserDetailCountOutput = new UserDetailCountOutput();
    public departmentUserHashtag: GetUserHashTagDto[] = [];
    public companyUserHashtag: ListResultDtoOfGetUserHashTagWithOrgIdDto = new ListResultDtoOfGetUserHashTagWithOrgIdDto();
    public userEndorsements: ListResultDtoOfGetUserEndorsementWithOrgIdDto = new ListResultDtoOfGetUserEndorsementWithOrgIdDto();
    public userOrgUnit: GetUserOrganizationUnitsByTenantIdOutput[] = [];
    public learningHashtags: any[] = [];
    public strengthHashtags: any[] = [];
    public valueEndorsements: any[] = [];
    public keyLearning: any[] = [];
    public keyStrengths: any[] = [];
    public corporateValues: any[] = [{ hashtag: "total", value: 0 }];
    public topEmployeesInStr: any[] = [];
    public topEmployeesInStrWithOrg: any[] = [];
    public corporateValuesHeader: any[] = [{ department: "Total", orgUnitId: 0 }];
    public activeUsers: number;
    profilePicture: string = "/assets/common/images/default-profile-picture.png";

    public appSession: AppSessionService;
    public pdfGenerator: PDFGeneratorService;
    remoteServiceBaseUrl: string = AppConsts.remoteServiceBaseUrl;


    // events
    public chartClicked(e: any): void {
    }

    public chartHovered(e: any): void {
    }

    public barChartOptions:any = {
      scaleShowVerticalLines: true,
      responsive: true,
    };
    public barChartType:string = 'horizontalBar';
    public barChartLegend:boolean = false;

    // First Chart
    public barChartLabels: string[] = [];
    public barChartData: any[] = [{ data: [null] }];
    public colorsOverride: Array<Color> = [{
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4a3cbb", "#00c459", "#607c8b", "#660066", "#990033"]
    }];

    // Second Chart
    public barChartLabelsSecond:string[] = [];
    public barChartDataSecond: any[] = [{ data: [null] }];

    // Third Chart
    public barChartLabelsThird:string[] = [];
    public barChartDataThird: any[] = [{ data: [null] }];

    constructor(
        private reportsService: ReportsService,
        private route: ActivatedRoute,
        private _humCycleService: HumCycleServiceProxy,
        private _humScoreService: HumScoreServiceProxy,
        private _userService: UserServiceProxy,
        private _userHashtagService: UserHashTagServiceProxy,
        private _userEndorsementService: UserEndorsementServiceProxy,
        private _organizationUnitService: OrganizationUnitHelperServiceProxy,
        private profileServiceProxy: ProfileServiceProxy,
        injector: Injector
    ) {
        super(injector);
        this.appSession = injector.get(AppSessionService);
        this.pdfGenerator = injector.get(PDFGeneratorService);
    }

    ngOnInit()  {
        this.sub = this.route.params.subscribe(params => {
            let self = this;

            // This is params to use anywhere in this component
            self.humCycleId = +params['humCycleId'];
            self.organizationUnitId = +params['organizationUnitId'];

            /*** Christian Web API START ***/
            self._humCycleService.getHumCycleById(self.humCycleId).subscribe(result => {
                self.humCycle = result;
            });
            
      });
    }

    ngAfterViewInit(): void {
        let self = this;

        //Get HumScores of whole company group by per department
        self._humScoreService.getHumScoreByHumCycleId(self.humCycleId)
            .subscribe(result => {
                if (self.organizationUnitId == 0 || self.organizationUnitId == null) {
                    self.humScore = result.items.filter(x => x.organizationUnit == null)[0];
                    self.humScoreList = result.items.filter(x => x.organizationUnit != null);
                }
                else {
                    self.humScoreList = result.items.filter(x => x.organizationUnitId == self.organizationUnitId);
                    self.humScore = self.humScoreList[0];
                }
                self.activeUsers = self.humScore.humScoreDetails.length==0? 0 : self.humScore.humScoreDetails[0].activeUsers;

                //update chart data
                self.updateChartData();

                //populate corporate value header
                self.humScoreList.forEach(hs => {
                    self.corporateValuesHeader.push({
                        department: hs.organizationUnit == null ? "" : hs.organizationUnit.displayName,
                        orgUnitId: hs.organizationUnitId
                    });

                });
            });

        if (self.organizationUnitId == 0 || self.organizationUnitId == null) {
            self._userService.getUserDetailCountByTenantId(self.appSession.tenantId)
                .subscribe(result => {
                    self.userDetailCount = result;
                });
        }
        else {
            self._userService.getUserDetailCountByOrgUnitId(self.organizationUnitId)
                .subscribe(result => {
                    self.userDetailCount = result;
                });
        }

        self.getUserHashtags()
            .subscribe(result => {
                self.companyUserHashtag = result;

                //Top Learning #
                self.learningHashtags = _(self.companyUserHashtag.items.filter(x => x.userHashTag.hashTag.hashTagTypes.hashTagTypeName == "Learn"))
                    .countBy(uht => uht.userHashTag.hashTag.tagName)
                    .map(function (count, hashtag) { return { count: count, hashtagName: hashtag } })
                    .sortBy('-count')
                    .value();

                //Top Strength #
                self.strengthHashtags = _(self.companyUserHashtag.items.filter(x => x.userHashTag.hashTag.hashTagTypes.hashTagTypeName == "Strength"))
                    .countBy(uht => uht.userHashTag.hashTag.tagName)
                    .map(function (count, hashtag) { return { count: count, hashtagName: hashtag } })
                    .sortBy('-count')
                    .value();

                //Top Key Learning by department
                self.humScoreList.forEach(hs => {
                    self.keyLearning.push(
                        {
                            departmentName: hs.organizationUnit == null ? "" : hs.organizationUnit.displayName,
                            learningHashtag: (_(self.companyUserHashtag.items.filter(x => x.userHashTag.hashTag.hashTagTypes.hashTagTypeName == "Learn" && x.userHashTag.humCycleId == hs.humCycleId))
                                .countBy(uht => uht.userHashTag.hashTag.tagName)
                                .map(function (count, hashtag) { return { count: count, hashtagName: hashtag } })
                                .sortBy('-count')
                                .value())[0]
                        }
                    );

                    this.getCorporateValues();  
                })

            });
            
        self.getUserEndorsements()
            .subscribe(result => {
                self.userEndorsements = result;
                
                self.topEmployeesInStr = _(self.userEndorsements.items.filter(ue => ue.userEndorsement.hashTag.hashTagTypes != null).filter(ue => ue.userEndorsement.hashTag.hashTagTypes.hashTagTypeName == "Strength"))
                    .countBy(function (value) { return value.userEndorsement.userId + '#' + value.userEndorsement.user.name + '#' + value.userEndorsement.user.surname + '#' + value.userEndorsement.user.profilePictureId })
                    .map(function (count, user) { return { count: count, userId: user.split("#")[0], name: user.split("#")[1], surname: user.split("#")[2], profilePicId : user.split("#")[3] } })
                    .sortBy('-count')
                    .value();
                    
                self.keyStrengths = _(self.userEndorsements.items.filter(ue => ue.userEndorsement.hashTag.hashTagTypes != null).filter(ue => ue.userEndorsement.hashTag.hashTagTypes.hashTagTypeName == "Strength"))
                    .countBy(ue => ue.userEndorsement.hashTag.tagName)
                    .map(function (count, hashtag) { return { count: count, hashtagName: hashtag } })
                    .sortBy('-count')
                    .value();

                //Top Strength #
                self.valueEndorsements = _(self.userEndorsements.items.filter(ue => ue.userEndorsement.hashTag.hashTagTypes != null).filter(x => x.userEndorsement.hashTag.hashTagTypes.hashTagTypeName == "Value"))
                    .countBy(function (value) { return value.userEndorsement.hashTag.tagName + '#' + value.organizationUnitId })
                    .map(function (count, endorse) { return { count: count, hashtagName: endorse.split("#")[0], orgUnitId: endorse.split("#")[1] } })
                    .sortBy('-count')
                    .value();
                    
                self.getUserOrganizations()
                    .subscribe(result => {
                        self.userOrgUnit = result.items;

                        self.topEmployeesInStr.forEach(e =>
                            self.topEmployeesInStrWithOrg.push(
                                {
                                    user: e.name + " " + e.surname,
                                    department: !Array.isArray(self.userOrgUnit.filter(ou => ou.userOrganizationUnitList != null))?
                                            self.userOrgUnit.filter(ou => ou.organizationUnit != null && ou.userOrganizationUnitList.items.filter(x => x.userId == e.userId) != null)[0].organizationUnit.displayName
                                                : "",
                                    profilePic: self.getProfilePicture(e.profilePicId)
                                }
                            )
                        );
                    });
            });
              
    }

    getProfilePicture(id): any {
        this.profileServiceProxy.getProfilePictureById(id).subscribe(result => {
            if (result && result.profilePicture) {
                this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
            }
        });
        return this.profilePicture;
    }

    getUserHashtags(): any {
        if (this.organizationUnitId == 0 || this.organizationUnitId == null)
            return this._userHashtagService.getUserHashTagWithOrgIdByHumCycleId(this.humCycleId);
        else
            return this._userHashtagService.getUserHashTagByOrgUnitId(this.organizationUnitId, this.humCycleId);
    }

    getUserEndorsements(): any {
        if (this.organizationUnitId == 0 || this.organizationUnitId == null)
            return this._userEndorsementService.getUserEndorsementWithOrgIdByHumCycleId(this.humCycleId);
        else
            return this._userEndorsementService.getUserEndorsementByOrgUnitId(this.organizationUnitId, this.humCycleId);
    }

    getUserOrganizations(): any {
        if (this.organizationUnitId == 0 || this.organizationUnitId == null)
            return this._organizationUnitService.getUserOrganizationUnitsByTenantId(this.appSession.tenantId);
        else
            return this._organizationUnitService.getUserOrganizationUnitsByOrgId(this.organizationUnitId);
    }

    getCorporateValues(): void {
        this.valueEndorsements.forEach(v => {
            let total = 0;
            let index = 0;
            
            this.corporateValuesHeader.forEach(vh => {
                if (index != 0) {
                    this.corporateValues.push({
                        hashtag: v.hashtagName,
                        value: vh.department + " " + this.valueEndorsements.filter(ve => ve.hashtagName == v.hashtagName && ve.orgUnitId == vh.orgUnitId).map(x => x.count)
                    });
                    total += v.count;
                }
                index++;
            })

            this.corporateValues[0] = [{ hashtag: v.hashtagName, value: total }]
        })
    }

    public updateChartData(): void {
        let self = this;

        this.barChartLabels = self.humScoreList.map(hs => hs.organizationUnit.displayName);

        // First Chart
        this.barChartData = [
            {
                data: self.humScoreList.map(hs => (hs.humScoreDetails[0].countPlay)), label: 'Play'
            }
        ];
        
        // Second Chart
        this.barChartDataSecond = [
            {
                data: self.humScoreList.map(hs => (hs.humScoreDetails[0].countLearn)), label: 'Learnings'
            }
        ];
        
        // Third Chart
        this.barChartDataThird = [
            {
                data: self.humScoreList.map(hs => (hs.humScoreDetails[0].countStrength)), label: 'Strengths'
            }
        ];
    }

    public generatePDF(): void {
        this.saving = true;

        this.pdfGenerator.GeneratePDF(this.humCycleId, this.organizationUnitId)
            .then(response => { this.saving = false; });
    }
}
