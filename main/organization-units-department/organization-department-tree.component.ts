import { Component, Injector, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { OrganizationUnitServiceProxy, ListResultDtoOfOrganizationUnitDto, OrganizationUnitDto, MoveOrganizationUnitInput } from '@shared/service-proxies/service-proxies';
import { Observable } from 'rxjs/Observable';
import { IBasicOrganizationUnitDepartmentInfo } from './basic-organization-unit-department-info';
import { IUserWithOrganizationUnit } from './user-with-organization-unit-department';
import { CreateOrEditUnitDepartmentModalComponent } from './create-or-edit-unit-department-modal.component';
import * as _ from "lodash";

export interface IOrganizationUnitDepartmentOnTree extends IBasicOrganizationUnitDepartmentInfo {
    id: number;
    parent: string | number;
    code: string;
    displayName: string;
    memberCount: number,
    text: string;
    state: any;
}

@Component({
    selector: 'organization-department-tree',
    templateUrl: "./organization-department-tree.component.html",
    styleUrls: ["./organization-department-tree.component.less"]
})
export class OrganizationDepartmentTreeComponent extends AppComponentBase implements AfterViewInit {

    @Output() ouSelected = new EventEmitter<IBasicOrganizationUnitDepartmentInfo>();

    @ViewChild('tree') tree: ElementRef;
    @ViewChild('createOrEditOrganizationUnitDepartmentModal') createOrEditOrganizationUnitDepartmentModal: CreateOrEditUnitDepartmentModalComponent;
    
    private _$tree: JQuery;
    private _updatingNode: any;

    constructor(
        injector: Injector,
        private _organizationUnitService: OrganizationUnitServiceProxy
    ) {
        super(injector);
    }

    totalUnitCount: number = 0;

    set selectedOu(ou: IOrganizationUnitDepartmentOnTree) {
        this._selectedOu = ou;
        this.ouSelected.emit(ou);
    }

    private _selectedOu: IOrganizationUnitDepartmentOnTree;

    ngAfterViewInit(): void {
        var self = this;
        this._$tree = $(this.tree.nativeElement);
        this.getTreeDataFromServer(treeData => {
            this.totalUnitCount = treeData.length;

            var jsTreePlugins = [
                'types',
                'contextmenu',
                'wholerow',
                'sort'
            ];

            if (this.isGranted('Pages.Administration.OrganizationUnits.ManageOrganizationTree')) {
                jsTreePlugins.push('dnd');
            }

            this._$tree
                .on('changed.jstree', (e, data) => {
                    if (data.selected.length !== 1) {
                        this.selectedOu = null;
                    } else {
                        this.selectedOu = data.instance.get_node(data.selected[0]).original;
                    }
                })
                .on('move_node.jstree', (e, data) => {

                    if (!this.isGranted('Pages.Administration.OrganizationUnits.ManageOrganizationTree')) {
                        this._$tree.jstree('refresh'); //rollback
                        return;
                    }

                    var parentNodeName = (!data.parent || data.parent === '#')
                        ? this.l('Root')
                        : this._$tree.jstree('get_node', data.parent).original.displayName;

                    this.message.confirm(
                        this.l('OrganizationUnitMoveConfirmMessage', data.node.original.displayName, parentNodeName),
                        isConfirmed => {
                            if (isConfirmed) {
                                let input = new MoveOrganizationUnitInput();
                                input.id = data.node.id;
                                input.newParentId = (!data.parent || data.parent === '#') ? undefined : data.parent;
                                this._organizationUnitService.moveOrganizationUnit(input)
                                    .catch(error => {
                                        this._$tree.jstree('refresh'); //rollback
                                        return Observable.throw(error);
                                    })
                                    .subscribe(() => {
                                        this.notify.success(this.l('SuccessfullyMoved'));
                                        this.reload();
                                    });
                            } else {
                                this._$tree.jstree('refresh'); //rollback
                            }
                        }
                    );
                })
                .jstree({
                    'core': {
                        data: treeData,
                        multiple: false,
                        check_callback: () => true
                    },
                    types: {
                        "default": {
                            "icon": "fa fa-folder tree-item-icon-color icon-lg"
                        },
                        "file": {
                            "icon": "fa fa-file tree-item-icon-color icon-lg"
                        }
                    },
                    contextmenu: {
                        items: function(node) { return self.contextMenu(node, self); }
                    },
                    sort: function (node1, node2) {
                        if (this.get_node(node2).original.displayName < this.get_node(node1).original.displayName) {
                            return 1;
                        }

                        return -1;
                    },
                    plugins: jsTreePlugins
                });

            this._$tree.on('click', '.ou-text .fa-caret-down', function (e) {
                e.preventDefault();

                var ouId = $(this).closest('.ou-text').attr('data-ou-id');
                setTimeout(() => {
                    self._$tree.jstree('show_contextmenu', ouId);
                }, 100);
            });
        });
    }

    reload(): void {
        this.getTreeDataFromServer(treeData => {
            this.totalUnitCount = treeData.length;
            (<any>this._$tree.jstree(true)).settings.core.data = treeData;
            this._$tree.jstree('refresh');
        });
    }

    private getTreeDataFromServer(callback: (ous: IOrganizationUnitDepartmentOnTree[]) => void): void {
        this._organizationUnitService.getOrganizationUnits().subscribe((result: ListResultDtoOfOrganizationUnitDto) => {
            var treeData = _.map(result.items, item => (<IOrganizationUnitDepartmentOnTree>{
                id: item.id,
                parent: item.parentId ? item.parentId : '#',
                code: item.code,
                displayName: item.displayName,
                memberCount: item.memberCount,
                text: this.generateTextOnTree(item),
                dto: item,
                state: {
                    opened: true
                }
            }));

            callback(treeData);
        });
    }

    private generateTextOnTree(ou: IOrganizationUnitDepartmentOnTree | OrganizationUnitDto) {
        var itemClass = ou.memberCount > 0 ? ' ou-text-has-members' : ' ou-text-no-members';
        return '<span title="' + ou.code + '" class="ou-text' + itemClass + '" data-ou-id="' + ou.id + '">' + ou.displayName + ' (<span class="ou-text-member-count">' + ou.memberCount + '</span>) <i class="fa fa-caret-down text-muted"></i></span>';
    }

    private contextMenu(node: any, self: OrganizationDepartmentTreeComponent) {
        let canManageOrganizationTree = self.isGranted('Pages.Administration.OrganizationUnits.ManageOrganizationTree');

        var items = {
            editUnit: {
                label: self.l('Edit'),
                _disabled: !canManageOrganizationTree,
                action: () => {
                    self._updatingNode = node;
                    self.createOrEditOrganizationUnitDepartmentModal.show({
                        id: node.id,
                        displayName: node.original.displayName
                    });
                }
            },

            addSubUnit: {
                label: self.l('AddSubUnit'),
                _disabled: !canManageOrganizationTree,
                action: () => {
                    self.addUnit(node.id);
                }
            },

            'delete': {
                label: self.l("Delete"),
                _disabled: !canManageOrganizationTree,
                action: data => {
                    var instance = $.jstree.reference(data.reference);

                    this.message.confirm(
                        this.l('OrganizationUnitDeleteWarningMessage', node.original.displayName),
                        isConfirmed => {
                            if (isConfirmed) {
                                this._organizationUnitService.deleteOrganizationUnit(node.id).subscribe(() => {
                                    this.selectedOu = null;
                                    this.notify.success(this.l('SuccessfullyDeleted'));
                                    instance.delete_node(node);
                                });
                            }
                        }
                    );
                }
            }
        }

        return items;
    }

    addUnit(parentId?: number): void {
        this.createOrEditOrganizationUnitDepartmentModal.show({
            parentId: parentId
        });
    }

    unitCreated(ou: OrganizationUnitDto): void {
        const instance = $.jstree.reference(this._$tree);
        instance.create_node(
            ou.parentId ? instance.get_node(ou.parentId) : '#',
            {
                id: ou.id,
                parent: ou.parentId ? ou.parentId : '#',
                code: ou.code,
                displayName: ou.displayName,
                memberCount: 0,
                text: this.generateTextOnTree(ou),
                state: {
                    opened: true
                }
            });
    }

    unitUpdated(ou: OrganizationUnitDto): void {
        const instance = $.jstree.reference(this._$tree);
        this._updatingNode.original.displayName = ou.displayName;
        instance.rename_node(this._updatingNode, this.generateTextOnTree(ou));
    }

    memberAdded(data: IUserWithOrganizationUnit): void {
        this.incrementMemberCount(data.ouId, 1);
    }

    memberRemoved(data: IUserWithOrganizationUnit): void {
        this.incrementMemberCount(data.ouId, -1);
    }

    incrementMemberCount(ouId: number, incrementAmount: number): void {
        var treeNode = this._$tree.jstree('get_node', ouId);
        treeNode.original.memberCount = treeNode.original.memberCount + incrementAmount;
        this._$tree.jstree('rename_node', treeNode, this.generateTextOnTree(treeNode.original));
    }
}