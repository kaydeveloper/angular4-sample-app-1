import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';
import { NgForm } from '@angular/forms';
import { OrganizationUnitHelperServiceProxy, UpdateOrganizationUnitInput, CreateOrganizationUnitInput, OrganizationUnitDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
//import { PermissionTreeComponent } from '../shared/permission-tree.component';

import * as _ from "lodash";

export interface IOrganizationUnitDepartmentOnEdit {
    id?: number;
    parentId?: number;
    code?: string;
    displayName?: string;
    isActive?: boolean;
}

@Component({
    selector: 'createOrEditCompanyDepartmentModal',
    templateUrl: './create-or-edit-companydepartment-modal.component.html'
})

export class CreateOrEditCompanyDepartmentModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @ViewChild('organizationUnitDepartmentDisplayName') organizationUnitDisplayNameInput: ElementRef;

    @Output() unitCreated: EventEmitter<OrganizationUnitDto> = new EventEmitter<OrganizationUnitDto>();
    @Output() unitUpdated: EventEmitter<OrganizationUnitDto> = new EventEmitter<OrganizationUnitDto>();

    active: boolean = false;
    saving: boolean = false;

    organizationUnit: IOrganizationUnitDepartmentOnEdit = {};

    constructor(
        injector: Injector,
        private _organizationUnitService: OrganizationUnitHelperServiceProxy,
        private _changeDetector: ChangeDetectorRef
    ) {
        super(injector);
    }

    onShown(): void {
        $(this.organizationUnitDisplayNameInput.nativeElement).focus();
    }

    show(organizationUnit: IOrganizationUnitDepartmentOnEdit): void {
        
        this.organizationUnit = organizationUnit;        
        
        if (!this.organizationUnit.id)
            this.organizationUnit.isActive = true;

        this.active = true;

        this._organizationUnitService.updateOrganizationUnit

        this.modal.show();
        this._changeDetector.detectChanges();

        ///console.log('in show method ' + organizationUnit);
    }

    save(): void {
        if (!this.organizationUnit.id) {
            this.createUnit();
        } else {
            this.updateUnit();
        }
    }

    createUnit() {
        let createInput = new CreateOrganizationUnitInput();
        createInput.parentId = this.organizationUnit.parentId;
        createInput.displayName = this.organizationUnit.displayName;
        createInput.code = this.organizationUnit.code;
        createInput.isActive = this.organizationUnit.isActive;

        this.saving = true;
        this._organizationUnitService
            .createOrganizationUnit(createInput)
            .finally(() => this.saving = false)
            .subscribe((result: OrganizationUnitDto) => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.unitCreated.emit(result);
            });
    }

    updateUnit() {
        let updateInput = new UpdateOrganizationUnitInput();
        updateInput.id = this.organizationUnit.id;
        updateInput.displayName = this.organizationUnit.displayName;
        updateInput.code = this.organizationUnit.code;
        updateInput.isActive = this.organizationUnit.isActive;


        this.saving = true;
        this._organizationUnitService
            .updateOrganizationUnit(updateInput)
            .finally(() => this.saving = false)
            .subscribe((result: OrganizationUnitDto) => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.unitUpdated.emit(result);
            });
    }

    close(): void {
        this.modal.hide();
        this.active = false;
    }
}