﻿import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { TenantServiceProxy, CreateTenantInput, CommonLookupServiceProxy, HumCycleConfigurationServiceProxy, HumCycleConfigurationDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { FeatureTreeComponent } from '../shared/feature-tree.component';

import * as _ from "lodash";

@Component({
    selector: 'createTenantModal',
    templateUrl: './create-tenant-modal.component.html'
})
export class CreateTenantModalComponent extends AppComponentBase {

    @ViewChild('tenancyNameInput') tenancyNameInput: ElementRef;
    @ViewChild('createModal') modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active: boolean = false;
    saving: boolean = false;
    setRandomPassword: boolean = true;
    useHostDb: boolean = true;
    editions = [];
    industries = [];
    tenant: CreateTenantInput;
    humCycleConfig: HumCycleConfigurationDto;
    tenantId: number = 0;

    constructor(
        injector: Injector,
        private _tenantService: TenantServiceProxy,
        private _commonLookupService: CommonLookupServiceProxy,
        private _humCycleConfigurationService: HumCycleConfigurationServiceProxy
    ) {
        super(injector);
    }

    show() {
        this.active = true;
        this.init();
        this.modal.show();
    }

    onShown(): void {
        $(this.tenancyNameInput.nativeElement).focus();
    }

    init(): void {
        this.tenant = new CreateTenantInput();
        this.tenant.isActive = true;
        this.tenant.shouldChangePasswordOnNextLogin = true;
        this.tenant.sendActivationEmail = true;
        this.tenant.editionId = 0;
        this.tenant.industryId = 0;

        this.humCycleConfig = new HumCycleConfigurationDto();

        this._commonLookupService.getEditionsForCombobox()
            .subscribe((result) => {
                this.editions = result.items;
                this.editions.unshift({ value: "0", displayText: this.l('NotAssigned') });

                this._commonLookupService.getDefaultEditionName().subscribe((getDefaultEditionResult) => {
                    var defaultEdition = _.filter(this.editions, { displayText: getDefaultEditionResult.name });
                    if (defaultEdition && defaultEdition[0]) {
                        this.tenant.editionId = parseInt(defaultEdition[0].value);
                    }
                });

            });

        this._commonLookupService.getIndustriesForCombobox()
            .subscribe((result) => {
                this.industries = result.items;
                this.industries.unshift({ value: "0", displayText: this.l('NotAssigned') });
            });
    }

    getEditionValue(item): number {
        return parseInt(item.value);
    }

    getIndustryValue(item): number {
        return parseInt(item.value);
    }

    save(): void {
        if (this.setRandomPassword) {
            this.tenant.adminPassword = null;
        }

        if (this.tenant.editionId === 0) {
            this.tenant.editionId = null;
        }

        if (this.tenant.industryId === 0) {
            this.tenant.industryId = null;
        }

        this.saving = true;
        this._tenantService.createTenant(this.tenant)
            //.finally(() => this.saving = false)
            .subscribe((result) => {
                this.tenantId = result;
                this.humCycleConfig.id = 0;
                this.humCycleConfig.isActive = true;
                this.humCycleConfig.tenantId = result;

                this._humCycleConfigurationService.upsertHumCycleConfiguration(this.humCycleConfig)
                    .finally(() => this.saving = false)
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });
            });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    getHumCycleConfiguration(): void {
        alert('x');
    }
}