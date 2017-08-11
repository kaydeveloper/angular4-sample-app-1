import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { ContentTypeServiceProxy, ContentTypeEditDto, CreateContentTypeInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { PermissionTreeComponent } from '../shared/permission-tree.component';

import * as _ from "lodash";

@Component({
    selector: 'createOrEditContentTypeModal',
    templateUrl: './create-or-edit-contenttype-modal.component.html'
})
export class CreateOrEditContentTypeModalComponent extends AppComponentBase {

    @ViewChild('contentTypeNameInput') contenttypeNameInput: ElementRef;
    @ViewChild('createOrEditModal') modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active: boolean = false;
    saving: boolean = false;

    contenttype: ContentTypeEditDto = new ContentTypeEditDto();
    constructor(
        injector: Injector,
        private _contenttypeService: ContentTypeServiceProxy
    ) {
        super(injector);
    }

    show(contnenttypeId?: number): void {
        let self = this;
        self.active = true;

        self._contenttypeService.getContentTypeForEdit(contnenttypeId).subscribe(result => {
            self.contenttype = result.contentType;
            self.modal.show();
        });


    }

    save(): void {
        var input = new CreateContentTypeInput();
        input.contentType = this.contenttype;

        this.saving = true;
        this._contenttypeService.createContentType(input)
            .finally(() => this.saving = false)
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
    onShown(): void {
        $(this.contenttypeNameInput.nativeElement).focus();
    }
}