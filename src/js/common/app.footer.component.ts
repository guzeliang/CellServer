import { Component } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';


@Component({
  selector: 'footer',
  providers:[],
  template: `
   <div class="navbar navbar-default  input-group-addon-format navbar-fixed-bottom" role="navigation" style="z-index: 2; background:#f5f5f5;">
        <div class="container fixed-width" style="line-height: 50px; vertical-align: middle;">
            <a class="center-block text-center" id="loginNav" href="#">生动细胞生物反应器</a>
        </div>
    </div>
 `  
})
export class FooterComponent {
}
