import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { IndustryServiceProxy, IndustryEditDto, CreateOrUpdateIndustryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';

import * as _ from "lodash";

@Component({
    selector: 'createOrEditIndustryModal',
    templateUrl: './create-or-edit-industry-modal.component.html'
})
export class CreateOrEditIndustryModalComponent extends AppComponentBase {

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('industryNameInput') industryNameInput: ElementRef;
    @ViewChild('createOrEditModal') modal: ModalDirective;

    active: boolean = false;
    saving: boolean = false;

    industry: IndustryEditDto = new IndustryEditDto();

    constructor(
        injector: Injector,
        private _industryService: IndustryServiceProxy
    ) {
        super(injector);
    }

    show(industryId?: number): void {
        let self = this;
        self.active = true;

        self._industryService.getIndustryForEdit(industryId).subscribe(result => {
            if (!result.industry.id)
                result.industry.isActive = true;

            self.industry = result.industry;

            self.modal.show();
        });
    }

    onShown(): void {
        $(this.industryNameInput.nativeElement).focus();
    }

    save(): void {
        let self = this;

        var input = new CreateOrUpdateIndustryDto();
        input.industry = self.industry;

        this.saving = true;
        this._industryService.createOrUpdateIndustry(input)
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
}