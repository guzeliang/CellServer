import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs';

@Injectable()
export class StatService {
    private apiUrl: string = '/api/iot';
    constructor(private http: Http) { }

    public get(condition: string): Promise<Response> {
      let opt = new RequestOptions({search: condition});
      return this.http.get(this.apiUrl + '/stat', opt).toPromise();
    }

    private generateSearchParams(condition: Object): string {
        let ret: string[] = [];
        for (let each in condition) {
          if (condition.hasOwnProperty(each)) {
            ret.push(each + '=' + condition[each]);
          }
        }
        return ret.join('&');
    }
}
