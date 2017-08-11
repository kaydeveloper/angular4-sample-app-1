import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AppGlobals {
    // use this property for property binding
    public isClassVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public isSideBarVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    setClassVisibilityStatus(isclassvisible) {
        this.isClassVisible.next(isclassvisible);
    }
    setSidebarVisibilityStatus(issidebarvisible) {
        this.isSideBarVisible.next(issidebarvisible);
    }
}