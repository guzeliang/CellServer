import { Injectable } from '@angular/core';
import { Device } from './device';
import { Headers, Http, Response, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs';

@Injectable()
export class DeviceService {
  private apiUrl: string = '/api/iot';
  constructor(private http: Http) { }
  
  public delete(id: number): Promise<Response> {
    return this.http.delete(this.apiUrl + '/' + id).toPromise();
  }

  public update(model: any): Promise<Response> {
    return this.http.put(this.apiUrl, model).toPromise();
  }

  public create(model: any): Promise<Response> {
    return this.http.post(this.apiUrl, model).toPromise();
  }

  public get(condition: Object): Promise<Response> {
    let opt = new RequestOptions({search: this.generateSearchParams(condition)});
    return this.http.get(this.apiUrl + '/list', opt).toPromise();
  }

  public page(condition: any): Promise<Response> {
    let opt = new RequestOptions({search: this.generateSearchParams(condition)});
    return this.http.get(this.apiUrl + '/page', opt).toPromise();
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
