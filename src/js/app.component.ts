import { Component } from '@angular/core';

@Component({
  selector: 'app',
  providers:[],
  template: `
    <router-outlet></router-outlet>
 `
})
export class AppComonent {
  hasHeader:boolean = false;

  constructor(){
  }

  ngOnInit() {

  }
}
