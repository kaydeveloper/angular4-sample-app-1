import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { ActivatedRoute , Router, Params} from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';
import { NgForm } from '@angular/forms';
import { HashTagServiceProxy, HashTagEditDto, HashTagDto, HashTagTypeDto, CreateHashTagInput, UserAnswerInput, HumCheckServiceProxy, UserUrlServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import * as _ from "lodash";

@Component({
    selector: 'userEndorsementModal',
    templateUrl: './user-endorsement-modal.component.html',

})
export class UserEndorsementModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;

    saving: boolean = false;
    //learncheck: boolean = false;
    filterText: string = '';
    strengthTagsList: string[] = [];
    learnTagsList: string[] = [];
    hashtag: HashTagDto[] = [];

    //-------------Hard Coded Question Ids ---------------------

    strengthQid: number =1;    
    playQid: number = 2;
    learnQid: number = 3;

    //-------------Content Types of questions asked---------------

    strengthContentTypeId: number;
    playContentTypeId: number;
    learnContentTypeId: number;

    //----------------------Answers-----------------------
    strengthAnswer: string = '';
    learnAnswer: string = '';

    useranswerinput: UserAnswerInput = new UserAnswerInput();

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private router: Router,
        private _hashtagService: HashTagServiceProxy,
        private _humCheckServiceProxy: HumCheckServiceProxy,
        private _userUrlServiceProxy: UserUrlServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewInit(): void {
        console.log('After  view Init');
        this._hashtagService.getStrengthHashTags().subscribe(p => { this.strengthTagsList = p.items; this.retrievedStrengthData(p.items); });
        this._hashtagService.getLearnHashTags().subscribe(p => { this.learnTagsList = p.items; this.retrievedLearnData(p.items); });
    }
    show(param?: string): void {
        console.log('Param values is: ' + param);

        //first confirm if its expired or not
        this._userUrlServiceProxy.getUserUrlByGUID(param,2).subscribe(p => {
            console.log(p.guid);
            if (p.guid) {
                this.modal.show();                
            }
            else {
                this.router.navigate(['/app/main/error-404']);
            }
        });
                
    }
    retrievedStrengthData(d): void {
        console.log('strength');
        this._activatedRoute.params.subscribe((params: Params) => {
            setTimeout(() => {

                this.strengthTagsList = d;


                (<any>$('#strengthinput')).atwho({
                    at: "#",
                    data: this.strengthTagsList,
                    limit: 200,
                    callbacks: {
                        afterMatchFailed: function (at, el) {
                            // 32 is spacebar
                            if (at == '#') {
                                this.strengthTagsList.push(el.text().trim().slice(1));
                                this.model.save(this.strengthTagsList);
                                this.insert(el.text().trim());
                                return false;
                            }
                        }
                    }
                });


            }, 0);

        });
    }

    retrievedLearnData(d): void {
        console.log('learn');
        this._activatedRoute.params.subscribe((params: Params) => {
            setTimeout(() => {

                this.learnTagsList = d;
                (<any>$('#learninput')).atwho({
                    at: "#",
                    data: this.learnTagsList,
                    limit: 200,
                    callbacks: {
                        afterMatchFailed: function (at, el) {
                            // 32 is spacebar
                            if (at == '#') {
                                this.learnTagsList.push(el.text().trim().slice(1));
                                this.model.save(this.learnTagsList);
                                this.insert(el.text().trim());
                                return false;
                            }
                        }
                    }
                });

            }, 0);
        }
    );
    }

    save(): void {
        this.useranswerinput.strengthAnswer = $('#strengthinput').text();
        this.useranswerinput.learnAnswer = $('#learninput').text();
        this.useranswerinput.userId = this.appSession.userId;
        this.useranswerinput.tenantId = this.appSession.tenantId;
        this.useranswerinput.strengthSelectedTags = $('#strengthinput span').text();
        this.useranswerinput.learnSelectedTags = $('#learninput span').text();

        //console.log(this.useranswerinput.strengthAnswer);
        //console.log(this.useranswerinput.learnAnswer);
        //save answers in user answer table which returns answer ids in response
        //save question id and answer id in userQuestion table
        //use maintianed list of strength hashtags and learn hashtagIds.
        this._humCheckServiceProxy.saveHumCheck(this.useranswerinput).subscribe(p => {
            if(p)
                this.notify.info(this.l('SavedSuccessfully'));    
        });
        


    }

    close(): void {
        this.modal.hide();
    }
    onShown(): void {
        
    }
}