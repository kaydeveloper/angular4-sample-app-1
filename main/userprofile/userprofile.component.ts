import { Component } from '@angular/core';



@Component({
    selector: 'user-profile',
    templateUrl: './userprofile.component.html'
})
export class UserProfileComponent {
    public currentCount = 0;
    public incrementUser() {
        this.currentCount++;
    }
}



