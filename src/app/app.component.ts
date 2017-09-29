import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app',
  providers: [],
  template: `
    <router-outlet></router-outlet>
 `
})
export class AppComponent implements OnInit {
  public hasHeader: boolean = false;
  public ngOnInit(): void {
    console.log('init');
  }
}
