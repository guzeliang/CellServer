import { Injectable } from '@angular/core';
import {Headers, Http, Response, RequestOptions} from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs';


@Injectable()
export class StatService {
    private apiUrl : string = '/api/iot';
    constructor(private http:Http) { }

    private generateSearchParams(condition:Object):string {
        let ret :string[] = [];
        for(let each in condition) {
            ret.push(each + '=' + condition[each]);
        }

        return ret.join('&');
    }

    get(condition:string): Promise<Response> {
        var opt = new RequestOptions({search:condition});
        return this.http.get(this.apiUrl + '/stat', opt).toPromise();
    }
}