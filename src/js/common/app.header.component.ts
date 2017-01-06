import { Component } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';


@Component({
  selector: 'header',
  providers:[],
  template: `
    <div class="navbar navbar-inverse navbar-fixed-top" id="topNav" role="navigation" style="z-index: 4;">
        <div class="container">
            <div class="navbar-header">
                <a class="navbar-brand"  routerLink="/devices" style="margin-top:-4px;"><i class="glyphicon glyphicon-home"></i> 设备管理</a>
            </div>
            <div class=" navbar-collapse">
                <ul class="nav navbar-nav" id="headNav">
                </ul>
                <ul class="nav navbar-nav navbar-right">
                </ul>
            </div>
        </div>
    </div>
 `
})
export class HeaderComponent {
}
