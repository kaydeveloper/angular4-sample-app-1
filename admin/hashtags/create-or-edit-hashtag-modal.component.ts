import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';
import { NgForm } from '@angular/forms';
import { HashTagServiceProxy, HashTagEditDto, HashTagTypeDto, CreateHashTagInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { PermissionTreeComponent } from '../shared/permission-tree.component';

import * as _ from "lodash";

@Component({
    selector: 'createOrEditHashtagModal',
    templateUrl: './create-or-edit-hashtag-modal.component.html'
})
export class CreateOrEditHashtagModalComponent extends AppComponentBase {

    @ViewChild('hashtagNameInput') hashtagNameInput: ElementRef;
    @ViewChild('createOrEditModal') modal: ModalDirective;
    @ViewChild('hashTagTypesCombobox') hashtagTypeCombobox: ElementRef;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    valueType: HashTagTypeDto;
    active: boolean = false;
    saving: boolean = false;
    _hashtagId: number;
    filterText: string = '';
    hashtagtypes: HashTagTypeDto[]=[];
    hashtag: HashTagEditDto = new HashTagEditDto();
    //Validation-------
    hashtagForm: NgForm;
    @ViewChild('hashtagForm') currentForm: NgForm;

    ngAfterViewChecked() {
        this.formChanged();
    }

    formChanged() {
        if (this.currentForm === this.hashtagForm) { return; }
        this.hashtagForm = this.currentForm;
        if (this.hashtagForm) {
            this.hashtagForm.valueChanges
                .subscribe(data => this.onValueChanged(data));
        }
    }


    onValueChanged(data?: any) {
        if (!this.hashtagForm) { return; }
        const form = this.hashtagForm.form;

        for (const field in this.formErrors) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);

            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    formErrors = {
        'tagName': '',
        'hashTagTypesId': ''
    };


    validationMessages = {
        'tagName': {
            'required': 'Tag Name is required.',
            'minlength': 'Tag Name must be at least 1 characters long.',
            'maxlength': 'Tag Name cannot be more than 15 characters long.'
        },
        'hashTagTypesId': {
            'required': 'Tag Type is required.'
        }
    };


    constructor(
        injector: Injector,
        private _hashtagService: HashTagServiceProxy,
        private _activatedRoute: ActivatedRoute
    ) {
        super(injector);
    }
   
    ngAfterViewInit(): void     {
        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';

        this._hashtagService.getHashTagType().subscribe(p => { this.hashtagtypes = p.items });
        //this._hashtagTypeService.getHashTagType().subscribe(result => {
        //    this.hashtagtypes = result.items;

        //});
    }
    show(hashtagId?: number): void {
        this.valueType = this.hashtagtypes.find(p => p.hashTagTypeName.toLowerCase() == 'value');        

        let self = this;
        self.active = true;
        
        self._hashtagService.getHashTagForEdit(hashtagId).subscribe(result => {
            self.hashtag = result.hashTag;
            self.modal.show();
        });

        this._hashtagId = hashtagId;
    }

    save(): void {
                
        if (this._hashtagId>0)
        {
            var hashtagedit = new CreateHashTagInput();
            hashtagedit.hashTag = this.hashtag;
            this.saving = true;

            this._hashtagService.updateHashTag(hashtagedit.hashTag)
                .finally(() => this.saving = false)
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
        else{
            var hashtaginput = new CreateHashTagInput();
            hashtaginput.hashTag = this.hashtag;
            this.saving = true;

            this._hashtagService.createHashTag(hashtaginput)
                .finally(() => this.saving = false)
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
        
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
    onShown(): void {
        $(this.hashtagNameInput.nativeElement).focus();
        $("select[name=hashTagTypesId]").selectpicker("refresh");
    }
}