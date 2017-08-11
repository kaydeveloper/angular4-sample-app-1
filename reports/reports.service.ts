import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ReportsService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private Url  = 'api/data.json';  // URL to web api
  private Url1 = 'api/data1.json';  // URL to web api
  private Url2 = 'api/data2.json';  // URL to web api

  constructor(private http: Http) { }

  getData(humCycleId: number, organizationUnitId: number): Promise<any> {
    return this.http.get(this.Url)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
  }

  /*
   * Function Name: getMiddleSec()
   * Date: 19 Apr, 2017
   */
  getMiddleSec(): Promise<any> {
    return this.http.get(this.Url1)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
  }

  /*
   * Function Name: getLastSec()
   * Date: 19 Apr, 2017
   */
  getLastSec(): Promise<any> {
    return this.http.get(this.Url2)
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
