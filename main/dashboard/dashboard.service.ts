import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DashboardService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private Url  = 'api/dashboard.json';  // URL to web api
  private profileUrl = 'api/profile.json';
  private strength = 'api/dashboard_strength.json';
  private team = 'api/dashboar_team.json';
  private cvalue = 'api/company_value.json';
  private dates = 'api/dates.json';

  constructor(private http: Http) { }

  /*
   * Function Name: getData()
   * Date: 19 Apr, 2017
   */
  getData(): Promise<any> {
    return this.http.get(this.Url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  /*
   * Function Name: getProfile()
   * Date: 23 May, 2017
   */
   getProfile(): Promise<any> {
       return this.http.get(this.profileUrl)
         .toPromise()
         .then(response => response.json())
         .catch(this.handleError);
   }

   /*
   * Function Name: getStrength()
   * Date: 23 May, 2017
   */
   getStrength(): Promise<any> {
       return this.http.get(this.strength)
         .toPromise()
         .then(response => response.json())
         .catch(this.handleError);
   }

   /*
   * Function Name: getTeam()
   * Date: 23 May, 2017
   */
   getTeam(): Promise<any> {
       return this.http.get(this.team)
         .toPromise()
         .then(response => response.json())
         .catch(this.handleError);
   }

   /*
   * Function Name: getCvalue()
   * Date: 23 May, 2017
   */
   getCvalue(): Promise<any> {
       return this.http.get(this.cvalue)
         .toPromise()
         .then(response => response.json())
         .catch(this.handleError);
   }

   /*
   * Function Name: getDates()
   * Date: 23 May, 2017
   */
   getDates(): Promise<any> {
       return this.http.get(this.dates)
         .toPromise()
         .then(response => response.json())
         .catch(this.handleError);
   }

  /*
   * Function Name: handleError()
   * Date: 14 Apr, 2017
   */
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
