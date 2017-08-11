import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { TenantServiceProxy, IndustryServiceProxy, CommonLookupServiceProxy, TenantEditDto, ComboboxItemDto, HumCycleConfigurationServiceProxy, HumCycleConfigurationEditDto, HumCycleConfigurationDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { FeatureTreeComponent } from '../shared/feature-tree.component';

import * as moment from "moment";
import * as _ from "lodash";

@Component({
    selector: 'editTenantModal',
    templateUrl: './edit-tenant-modal.component.html'
})
export class EditTenantModalComponent extends AppComponentBase {

    @ViewChild('nameInput') nameInput: ElementRef;
    @ViewChild('editModal') modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active: boolean = false;
    saving: boolean = false;

    tenant: TenantEditDto = undefined;
    humCycleConfigEditDto: HumCycleConfigurationEditDto = new HumCycleConfigurationEditDto();
    humCycleConfig: HumCycleConfigurationDto = new HumCycleConfigurationDto();
    currentConnectionString: string;
    editions: ComboboxItemDto[] = [];
    industries: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private _tenantService: TenantServiceProxy,
        private _industryService: IndustryServiceProxy,
        private _commonLookupService: CommonLookupServiceProxy,
        private _humCycleConfigurationService: HumCycleConfigurationServiceProxy
    ) {
        super(injector);
    }

    show(tenantId: number): void {
        this.active = true;

        this._commonLookupService.getEditionsForCombobox().subscribe(result => {
            this.editions = result.items;
            var notSelectedEdition = new ComboboxItemDto();
            notSelectedEdition.displayText = this.l('NotAssigned');
            notSelectedEdition.value = "";
            this.editions.unshift(notSelectedEdition);

            this._tenantService.getTenantForEdit(tenantId).subscribe((result) => {
                this.tenant = result;
                this.currentConnectionString = result.connectionString;
                this.tenant.editionId = this.tenant.editionId || 0;
                this.tenant.industryId = this.tenant.industryId || 0;
                this.modal.show();
            });
        });

        this._commonLookupService.getIndustriesForCombobox().subscribe(result => {
            this.industries = result.items;
            var notSelectedIndustry = new ComboboxItemDto();
            notSelectedIndustry.displayText = this.l('NotAssigned');
            notSelectedIndustry.value = "0";
            this.industries.unshift(notSelectedIndustry);
        });

        this._humCycleConfigurationService.getHumCycleConfigurationByTenantId(tenantId).subscribe(result => {
            this.humCycleConfigEditDto = result.humCycle;
        });
    }

    onShown(): void {
        $(this.nameInput.nativeElement).focus();
    }

    save(): void {
        if (this.tenant.editionId === 0) {
            this.tenant.editionId = null;
        }

        if (this.tenant.industryId === 0) {
            this.tenant.industryId = null;
        }

        this.saving = true;
        this._tenantService.updateTenant(this.tenant)
            //.finally(() => )
            .subscribe(() => {


                this.humCycleConfig = new HumCycleConfigurationDto();
                
                this.humCycleConfig.id = this.humCycleConfigEditDto.id;
                this.humCycleConfig.isActive = true;
                this.humCycleConfig.tenantId = this.tenant.id;
                this.humCycleConfig.humCycleDurationWeeks = this.humCycleConfigEditDto.humCycleDurationWeeks;
                this.humCycleConfig.startDayofWeek = this.humCycleConfigEditDto.startDayofWeek;
                this.humCycleConfig.humCheckDurationDays = this.humCycleConfigEditDto.humCheckDurationDays;
                this.humCycleConfig.userEndorseDurationDays = this.humCycleConfigEditDto.userEndorseDurationDays;
                this.humCycleConfig.humScoreReportOffsetDays = this.humCycleConfigEditDto.humScoreReportOffsetDays;

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
}