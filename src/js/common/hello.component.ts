import { Component } from '@angular/core';
import { Headers, Http, Response,RequestOptions } from '@angular/http';

import 'rxjs/add/operator/toPromise';


@Component({
  selector: 'hello',
  providers:[],
  template: `
   <h1>hello world, {{title}}</h1>
 `
})
export class HelloComponent {
  title = 'Tour of Heroes';
  isshow=true;

  constructor( private http:Http) {
  }

  ngOnInit(): void {
     this.http.get('/foo').subscribe((res :Response) => {
        this.title = res.json().data
     }, (err:any) => {
     });
  }
}
