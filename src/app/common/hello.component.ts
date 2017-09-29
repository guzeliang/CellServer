import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'hello',
  providers: [],
  template: `
   <h1>hello world, {{title}}</h1>
 `
})
export class HelloComponent implements OnInit {
  public title = 'Tour of Heroes';
  public isshow= true;

  constructor( private http: Http) {
  }

  public ngOnInit(): void {
    this.http.get('/foo').subscribe((res: Response) => {
      this.title = res.json().data;
    }, (err: any) => {
      console.log(err);
    });
  }
}
