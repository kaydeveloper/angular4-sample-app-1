import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';
import { HashTagTypeServiceProxy, /*HashTagTypeEditDto,*/ HashTagTypeDto /*,CreateHashTagTypeInput*/ } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { PermissionTreeComponent } from '../shared/permission-tree.component';

import * as _ from "lodash";

@Component({
    selector: 'createOrEditHashtagTypeModal',
    templateUrl: './create-or-edit-hashtagtype-modal.component.html'
})
export class CreateOrEditHashtagTypeModalComponent extends AppComponentBase {

    @ViewChild('hashtagTypeNameInput') hashtagTypeNameInput: ElementRef;
    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active: boolean = false;
    saving: boolean = false;
    filterText: string = '';
    hashtagtypes: HashTagTypeDto[]=[];
    //hashtagtype: HashTagTypeEditDto = new HashTagTypeEditDto();
    constructor(
        injector: Injector,
        private _hashtagTypeService: HashTagTypeServiceProxy,
        private _activatedRoute: ActivatedRoute
    ) {
        super(injector);
    }
    ngAfterViewInit(): void 
    {
        this.filterText = this._activatedRoute.snapshot.queryParams['filterText'] || '';
        //this._hashtagTypeService.getHashTagType(1, this.filterText).subscribe(result => {
        //    this.hashtagtypes = result.items;

        //});
    }
    show(hashtagtypeId?: number): void {
        let self = this;
        self.active = true;
        
        //self._hashtagTypeService.getHashTagTypeForEdit(hashtagtypeId).subscribe(result => {
        //    self.hashtagtype = result.hashTagType;
        //    self.modal.show();
        //});

        
    }

    save(): void {
        //var input = new CreateHashTagTypeInput();
        //input.hashTagType = this.hashtagtype;

        //this.saving = true;
        //this._hashtagTypeService.createHashTagType(input)
        //    .finally(() => this.saving = false)
        //    .subscribe(() => {
        //        this.notify.info(this.l('SavedSuccessfully'));
        //        this.close();
        //        this.modalSave.emit(null);
        //    });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
    onShown(): void {
        $(this.hashtagTypeNameInput.nativeElement).focus();
        //$(this.hashtagTypeCombobox.nativeElement).selectpicker('refresh');
    }
}