import { Component, Inject, ViewContainerRef, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { ChatSignalrService } from 'app/shared/layout/chat/chat-signalr.service';
import { SignalRHelper } from 'shared/helpers/SignalRHelper';
//import { DOCUMENT } from '@angular/platform-browser';
//import { AppGlobals } from '../app/main/global'; 
@Component({
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
    private _isClassVisible = true;
    //private _isNavVisible = false;
    private viewContainerRef: ViewContainerRef;
    private showsidebar = true;
    private param: string;
    public constructor(
        viewContainerRef: ViewContainerRef,
        //private _appGlobals: AppGlobals,
        private _chatSignalrService: ChatSignalrService,
        
        /*@Inject(DOCUMENT) private document: any,*/
        router: Router        
    ) {
        this.viewContainerRef = viewContainerRef;

        router.events.subscribe((path) => {
            //if (path.toString().indexOf('hashtags') > 0) {
            //    this._isNavVisible = true;
            //}
            //else this._isNavVisible = false;

            

            if (path.toString().indexOf('user-profile') > 0 || path.toString().indexOf('error') > 0
                || path.toString().indexOf('company-hashtag') > 0 || path.toString().indexOf('usersfront') > 0
                || path.toString().indexOf('company-department') > 0 || path.toString().indexOf('dashboard') > 0
                || path.toString().indexOf('hum-check') > 0

            ) {
                this._isClassVisible = false;
                this.showsidebar = false;
            }
            else {
                this._isClassVisible = true;
                this.showsidebar = true;
            }
        });


        
        
        //const path: string = this.document.location.href;
        //if (path.toString().indexOf('user-profile') > 0) {            

        //}
        //else {
            
        //}
    }

    ngOnInit(): void {
        SignalRHelper.initSignalR(() => { this._chatSignalrService.init(); });
    }

    ngAfterViewInit(): void {
        App.init();
        App.initComponents();
        Layout.init();
    }

    //@HostListener('window:hashchange', ['$event'])
    //onHashChange(event) {
    //    this.checkCurrentURL();
    //}
    //private checkCurrentURL()
    //{
    //    console.log('location ' + window.location.pathname);
    //}
}



//if (window.location.toString().indexOf('user-profile') > 0)
//{
//    $(".page-sidebar-wrapper").hide();
//    $('.page-content-wrapper>.page-content').removeClass('page-content');
//}
//else
//{
//    $(".page-sidebar-wrapper").show();
//    $('.page-content-wrapper').children().first().addClass('page-content');
//}