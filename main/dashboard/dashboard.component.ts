import { Component, OnInit, Injector, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppConsts } from '@shared/AppConsts';
import {
    OrganizationUnitHelperServiceProxy, HumCycleServiceProxy, HumScoreServiceProxy, UserQuestionServiceProxy, UserEndorsementServiceProxy, UserHashTagServiceProxy,
    OrganizationUnitHelperDto, HumCycleDto, HumScoreDto, UserLoginInfoDto, GetUserQuestionsDto, UserEndorsementDto, GetUserHashTagDto
} from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { DashboardService } from './dashboard.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less'],
    animations: [appModuleAnimation()]
})

export class DashboardComponent extends AppComponentBase implements OnInit {
    constructor(
        injector: Injector,
        private dashboardService: DashboardService,
        private _organizationHelperService: OrganizationUnitHelperServiceProxy,
        private _humCycleService: HumCycleServiceProxy,
        private _humScoreService: HumScoreServiceProxy,
        private _userQuestionService: UserQuestionServiceProxy,
        private _userEndorsementService: UserEndorsementServiceProxy,
        private _userHashtagService: UserHashTagServiceProxy
    ) {
        super(injector);
        this.appSession = injector.get(AppSessionService);
    }

  firstSection = [];
  profileSection = [];
  strength = [];
  teams = [];
  cvlaue = [];
  dates = [];
  appSession: AppSessionService;

  //web api variables
  selectedOrgUnitId: number = 0;
  selectedHumCycleId: number = 0;
  organizationUnit: OrganizationUnitHelperDto[] = [];
  humCycle: HumCycleDto[] = [];
  humScore: HumScoreDto = new HumScoreDto;
  userprofile: UserLoginInfoDto;
  userQuestion: GetUserQuestionsDto[] = [];
  isLearn: string;
  isPlay: string;
  numberOfEndorsement: number = 0;
  userHashtagsOfUser: string[] = [];
  department: string;
  
  whform: FormGroup;

  ngOnInit() {
      let self = this;

      this.userprofile = this.appSession.user;

    this.whform = new FormGroup({
        'department': new FormControl(null, Validators.required),
        'customDates': new FormControl(null, Validators.required)
    });
    
    /*** Christian Web API START ***/
    self._organizationHelperService.getOrganizationUnitByUserId(self.appSession.userId)
        .subscribe(result => {
            self.organizationUnit.push(result);
            self.department = result.displayName;
        });

    self._humCycleService.getHumCyclesByTenantId(self.appSession.tenantId)
        .subscribe(result => {
            self.humCycle = result.items;
            self.selectedHumCycleId = result.items[0].id;

            self.updateWorkhum();
        });
        
  }

  /*
   * update form
   */
  updateWorkhum() {
      let self = this;

      self.getHumScore(self.selectedHumCycleId, self.selectedOrgUnitId);
      self.getUserEndorsementsByUserId(self.appSession.userId, self.selectedHumCycleId);
      self.getUserQuestionByUserId(self.appSession.userId, self.selectedHumCycleId);
      self.getUserHashTagByUserId(self.appSession.userId, self.selectedHumCycleId)
  }


  ngAfterViewInit() {
      let self = this;
      
    this.dashboardService.getData().then(response => {
      this.firstSection = response;
    });

    /*
     * Description: Profile Section Management
     */
     this.dashboardService.getProfile().then(response => {
       this.profileSection = response;
     });

     /*
     * Description: Strength Section Management
     */
     this.dashboardService.getStrength().then(response => {
       this.strength = response;
     });

     /*
     * Description: Team Section Management
     */
     this.dashboardService.getTeam().then(response => {
       this.teams = response;
     });

     /*
     * Description: Cvalue Section Management
     */
     this.dashboardService.getCvalue().then(response => {
       this.cvlaue = response;
     });

     /*
     * Description: Dates Section Management
     */
     this.dashboardService.getDates().then(response => {
       this.dates = response;
       console.log(this.dates);
     });
  }

  getHumScore(humCycleId: number, orgUnitId: number) {
      let self = this;

      this._humScoreService.getHumScoreByIds(humCycleId, orgUnitId)
          .subscribe(result => {
              self.humScore = result;
          });
  }

  getUserQuestionByUserId(userId: number, humCycleId: number) {
      let self = this;

      this._userQuestionService.getUserQuestionByUserId(userId, humCycleId)
          .subscribe(result => {
              if (result.items.length > 0) {
                  var learnUserQuestion = result.items.filter(x => x.question.contentType.contentTypeName == "Learn")[0];
                  var playUserQuestion = result.items.filter(x => x.question.contentType.contentTypeName == "Play")[0];

                  if (learnUserQuestion.userAnswer.isLearn == true)
                      self.isLearn = "Yes";
                  else
                      self.isLearn = "No";


                  if (playUserQuestion.userAnswer.isPlay == true)
                      self.isPlay = "Yes";
                  else
                      self.isPlay = "No";
              }
              else {
                  self.isLearn = "No";
                  self.isPlay = "No";
              }
          });
  }

  getUserEndorsementsByUserId(userId: number, humCycleId: number) {
      let self = this;

      this._userEndorsementService.getUserEndorsementsByUserId(userId, humCycleId)
          .subscribe(result => {
              self.numberOfEndorsement = result.items.length;
          });
  }

  getUserHashTagByUserId(userId: number, humCycleId: number) {
      let self = this;

      this._userHashtagService.getUserHashTagsByUserId(userId, humCycleId)
          .subscribe(result => {
              self.userHashtagsOfUser = result.items.filter(x => x.hashTag.hashTagTypes.hashTagTypeName == "Strength").map(x => x.hashTag.tagName);
          });
  }

}
