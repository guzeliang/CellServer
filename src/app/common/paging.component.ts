import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'pagination',
  providers: [],
  template: `
   <div class="page_y ng-isolate-scope" id="pager" pager="" target-ele="#userList">
     <ul class="pagination">
       <li><span class="pageinfo">共<strong> 1 </strong>页<strong> 0 </strong>条</span></li>
       <li><a href="javascript:void(0)">首页</a></li> 
       <li><a href="javascript:void(0)"> 上一页 </a></li> 
       <li class="thisclass"><a href="javascript:void(0)"> 1 </a></li> 
       <li><a href="javascript:void(0)"> 下一页 </a></li> 
       <li><a href="javascript:void(0)">末页</a></li> 
       <li>
         <span class="pageinput">
           <input class="pagetxt" type="text" name="gopage" id="gopage" size="2" value="1">
           <a href="javascript:void(0)"> GO </a>
         </span>
       </li>
     </ul>
   </div>
 `
})
export class PagingComponent  implements OnInit {
  public pageSize: number;
  public recordCount: number;
  public pageIndex: number;
  public temppage: number;
  public callback: Function;
  public condition: any;
  public interval: number;
  public absdiff: number;
  public flag: boolean;
  public pagecount: number;
  public pref: string;

  constructor(
    pageSize: number, 
    recordCount: number, 
    pageIndex: number , 
    condition: any, 
    callback: Function) {
    this.pageSize = pageSize;
    this.recordCount = recordCount;
    this.pageIndex = pageIndex;
    this.temppage = this.pageIndex;
    this.callback = callback;
    this.condition = condition;

    this.interval = 3;
    this.absdiff = (this.interval - 1) / 2;

    this.pagecount = Math.ceil(this.recordCount / this.pageSize);
    if (this.pageIndex > this.pagecount) {
      this.pageIndex = this.pagecount;
    }

    if (this.pagecount === 0) {
      this.pagecount = 1;
    }

    if (this.pageIndex === 0) {
      this.pageIndex = 1;
    }

    this.flag = false;
    let aaaa = this;
    this.pref = (arguments.length > 5) ? arguments[5] : '';
  }

  public create(): Function {
    return function () {
      this.renderHtml.apply(this, arguments);
    };
  }

  public pagerDelegate(obj: any, method: Function, mode: any): Function {
    return function () {
      let args: any[] = [];
      args.push(mode);
      method.apply(obj, args);
    };
  }

  public ngOnInit(): void {
    let _this = this;
    window.onhashchange = function() {
      let hashPage = location.hash.substr(location.hash.indexOf('page') + 4);

      if (hashPage.length <= 0) {
        hashPage = '1';
      }

      let tt = _this.pagerDelegate(_this, _this.callback, 
        { mode: 'nums', val: parseInt(hashPage, null) });

      if (_this.flag !== true 
        && (('#' + _this.pref + 'page' + hashPage === location.hash)
       || (hashPage === '1' && location.hash === '#'))) {
          tt();
      }
      _this.flag = false;
    };
  }
}
