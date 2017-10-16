import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Location } from '@angular/common';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'pagination',
  providers: [],
  styleUrls: [ './pager.css'],
  template: `
   <div class='page_y'  [hidden]='isHiddenWhenEmpty && displayPages.length == 0' id='pager'>
     <ul class='pagination'>
       <li>
       <span class='pageinfo'>
        共<strong> {{pagecount}} </strong>页<strong> {{recordCount}} </strong>条</span>
       </li>
       <li><a href='javascript:void(0)' (click)='pagex($event)' mode='first'>首页</a></li> 
       <li><a href='javascript:void(0)' (click)='pagex($event)' mode='prev'> 上一页 </a></li> 
       <li *ngFor='let x of displayPages' [class.thisclass]='x===pageIndex'>
        <a (click)='pagex($event)'  mode='destpage' href='javascript:void(0)'> {{x}} </a>
       </li>
       <li><a href='javascript:void(0)' (click)='pagex($event)' mode='next'> 下一页 </a></li> 
       <li><a href='javascript:void(0)' (click)='pagex($event)' mode='last'>末页</a></li> 
       <li>
         <span class='pageinput'>
           <input class='pagetxt' type='text' [(ngModel)]='goPageIndex' size='2' value='1'>
           <a href='javascript:void(0)' (click)='goPage()'> GO </a>
         </span>
       </li>
     </ul>
   </div>
 `
})
export class PagingComponent  implements OnInit {
  @Input() public pageSize: number = 20;
  @Input() public interval: number = 3;
  @Input() public isHiddenWhenEmpty: boolean = true;
  @Input() public condition: any;

  public pageIndex: number;
  public recordCount: number = 0;
  public temppage: number;
  public goPageIndex: number = 1;
 
  public absdiff: number;
  public flag: boolean;
  public pagecount: number = 0;
  public pref: string;
  public displayPages: number[] = [];
  @Output() public pageChange: EventEmitter<number> = new EventEmitter<number>();

  public constructor(private location: Location) {}
  public callback: Function = function() { 
    console.log('x');
  };

  public goPage() {
    if (this.goPageIndex <= 0 ) {
      this.goPageIndex = 1;
    }
    if (this.goPageIndex > this.pagecount) {
      this.goPageIndex = this.pagecount;
    }

    let index = this.goPageIndex;
    this.render(index, this.recordCount);
  }

  public pagex(e) {
    let p = e.target;
    console.log(e.target.innerHTML, p.getAttribute('mode'));

    let mode = p.getAttribute('mode') || 'destpage';
    let index = this.pageIndex;

    switch (mode) {
      case 'first' : index = 1; break;
      case 'last' : index = this.pagecount; break;
      case 'prev' : index = this.pageIndex  === 1 
        ? this.pageIndex : this.pageIndex - 1; break;
      case 'next' : index = this.pageIndex === this.pagecount 
        ? this.pageIndex : this.pageIndex + 1; break;
      case 'destpage' : index = +(e.target.innerHTML); break;
      default : break;
    }
    
    this.render(index, this.recordCount);
    this.pageChange.emit(index);
  }

  public render(currIndex: number, allCount: number) {
    this.recordCount = allCount;
    this.pagecount = Math.ceil(allCount / this.pageSize);
    this.pageIndex = currIndex;

    this.displayPages.length = 0;

    let absdiff = (this.interval - 1) / 2;
    let start = 0;
    let end = 0;

    if (this.pageIndex + absdiff > this.interval 
      && this.pageIndex + absdiff <= this.pagecount) {
        start = this.pageIndex - absdiff;
        end = this.pageIndex + absdiff;
    } else if (this.pageIndex + absdiff <= this.interval) {
      start = 1;
      end = this.interval;
    } else if (this.pageIndex + absdiff > this.pagecount) {
      start = this.pagecount - this.interval + 1;
      end = this.pagecount;
    }

    for (let i = start; i <= end ; i++) {
      if (i > 0 && i <= this.pagecount) {
        this.displayPages.push(i);
      }
    }

    let arr = location.hash.split('/page/');

    if (arr.length === 2) {
      arr.pop();
    }
    arr.push(this.pageIndex + '');
    this.location.go(arr.join('/page/').slice(1));
  }
  public ngOnInit(): void {
    console.log(this.pageSize);
    
    // window.onhashchange = function() {
    //   let hashPage = location.hash.substr(location.hash.indexOf('page') + 4);

    //   if (hashPage.length <= 0) {
    //     hashPage = '1';
    //   }

    //   let tt = _this.pagerDelegate(_this, _this.callback, 
    //     { mode: 'nums', val: parseInt(hashPage, null) });

    //   if (_this.flag !== true 
    //     && (('#' + _this.pref + 'page' + hashPage === location.hash)
    //    || (hashPage === '1' && location.hash === '#'))) {
    //       tt();
    //   }
    //   _this.flag = false;
    // };
  }
  
  public init( 
    pageSize: number, 
    recordCount: number, 
    pageIndex: number , 
    condition: any, 
    callback: Function)  {
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
  
      if (!window.onhashchange) {
        window.onhashchange = function(e) {
          let hashPage = location.hash.substr(location.hash.indexOf('page') + 4);
          if (hashPage.length <= 0) {
            hashPage = '1';
          }
  
          let tt = aaaa.pagerDelegate(aaaa, callback, 
            { mode: 'nums', val: parseInt(hashPage, null) });
  
          if (aaaa.flag !== true && (('#' + aaaa.pref + 'page' + hashPage === location.hash) 
          || (hashPage === '1' && location.hash === '#'))) {
              tt();
          }
  
          aaaa.flag = false;
        };
      }
    }

  public create(): Function {
    return function () {
      this.renderHtml.apply(this, arguments);
    };
  }

  public pagerDelegate(obj: any, method: Function, mode: any): any {
    return function () {
      let args: any[] = [];
      args.push(mode);
      method.apply(obj, args);
    };
  }

  public getDefaultIndex(): Number {
    let hashPage = location.hash.substr(location.hash.indexOf('page') + 4);
    return hashPage.length <= 0 ? 1 : parseInt(hashPage, null);
  }
  public handleTextChanged() {
    this.temppage = arguments[0].objRef.value;
  }

  public renderHtml(): void {
    // let _container = arguments[0];
    let _container = $('.pagination').get(0);
    _container.innerHTML = '';
    _container.appendChild(
      document.createTextNode(`共${this.recordCount}条数据 ${this.pageIndex} / ${this.pagecount}页 `));

    // 第一页
    let firstA = document.createElement('A');

    firstA.appendChild(document.createTextNode('首1页'));
    firstA.setAttribute('href', 'javascript:void(0)');
    firstA.onclick = this.pagerDelegate(this, this.callback, { mode: 'first' });

    _container.appendChild(firstA);
    _container.appendChild(document.createTextNode(' '));

    // 上一页
    let previousA = document.createElement('A');

    previousA.appendChild(document.createTextNode('上一页'));
    previousA.setAttribute('href', 'javascript:void(0)');
    previousA.onclick = this.pagerDelegate(this, this.callback, {mode: 'previous' });

    _container.appendChild(previousA);
    _container.appendChild(document.createTextNode(' '));

    // 下一页
    let nextA = document.createElement('A');

    nextA.appendChild(document.createTextNode('下一页'));
    nextA.setAttribute('href', 'javascript:void(0)');
    nextA.onclick = this.pagerDelegate(this, this.callback, {mode: 'next' });

    _container.appendChild(nextA);
    _container.appendChild(document.createTextNode(' '));

    // 末页
    let lastA = document.createElement('A');

    lastA.appendChild(document.createTextNode('末页'));
    lastA.setAttribute('href', 'javascript:void(0)');
    lastA.onclick = this.pagerDelegate(this, this.callback, {mode: 'last' });

    _container.appendChild(lastA);
    _container.appendChild(document.createTextNode(' '));
  }

  public generateNumsText(start: Number, interval: Number, container: any): any {
    let _container = arguments[2];
    if (arguments[0] < 1) {
      arguments[0] = 1;
    }
    if (arguments[1] > this.pagecount) {
      arguments[1] = this.pagecount;
    }

    for (let i = arguments[0]; i <= arguments[1]; i++) {

      let numsLi = $('<li></li>').get(0);
      let numsA = $('<a></a>').get(0);

      if (i === this.pageIndex) {
        $(numsLi).addClass('thisclass');
        numsA.appendChild(document.createTextNode(` ${i} `));
      } else {
        numsA.appendChild(document.createTextNode(i.toString()));
      }

      numsA.setAttribute('href', 'javascript:void(0)');
      numsA.onclick = this.pagerDelegate(this, this.callback, { mode: 'nums', val: i });

      numsLi.appendChild(numsA);
      _container.appendChild(numsLi);
      _container.appendChild(document.createTextNode(' '));
    }
  }

  public renderNumberStyleHtml(): void {
    let _container = arguments[0];
    _container.innerHTML = '';

    let _containerUl = $('<ul></ul>').get(0);
    $(_containerUl).addClass('pagination');

    let _liele = $('<li></li>').get(0);
    let _spanele = $('<span></span>').get(0);

    $(_spanele).addClass('pageinfo');
    _liele.appendChild(_spanele);

    let allStrong1 = $('<strong></strong>').get(0);
    let allStrong2 = $('<strong></strong>').get(0);

    allStrong1.appendChild(document.createTextNode(` ${this.pagecount} `));
    allStrong2.appendChild(document.createTextNode(` ${this.recordCount} `));
    _spanele.appendChild(document.createTextNode('共'));
    _spanele.appendChild(allStrong1);
    _spanele.appendChild(document.createTextNode('页'));
    _spanele.appendChild(allStrong2);
    _spanele.appendChild(document.createTextNode('条'));

    _containerUl.appendChild(_liele);

    // 第一页
    let firstLi = $('<li></li>').get(0);
    let firstA = $('<a></a>').get(0);

    firstA.appendChild(document.createTextNode('首x页'));
    firstA.setAttribute('href', 'javascript:void(0)');
    firstA.onclick = this.pagerDelegate(this, this.callback, {mode: 'first' });
    firstLi.appendChild(firstA);

    _containerUl.appendChild(firstLi);
    _containerUl.appendChild(document.createTextNode(' '));

    // 上一页
    let previousLi = $('<li></li>').get(0);
    let previousA = $('<a></a>').get(0);

    previousA.appendChild(document.createTextNode(' 上一页 '));
    previousA.setAttribute('href', 'javascript:void(0)');
    previousA.onclick = this.pagerDelegate(this, this.callback, {mode: 'previous' });
    previousLi.appendChild(previousA);

    _containerUl.appendChild(previousLi);
    _containerUl.appendChild(document.createTextNode(' '));

    // 此处开始渲染中间页码串
    if (this.pageIndex + this.absdiff > this.interval 
      && this.pageIndex + this.absdiff <= this.pagecount) {
      this.generateNumsText(this.pageIndex - this.absdiff, 
        this.pageIndex + this.absdiff, _containerUl);
    } else if (this.pageIndex + this.absdiff <= this.interval) {
      this.generateNumsText(1, this.interval, _containerUl);
    } else if (this.pageIndex + this.absdiff > this.pagecount) {
      this.generateNumsText(this.pagecount - this.interval + 1, this.pagecount, _containerUl);
    }

    // 下一页
    let nextLi = $('<li></li>').get(0);
    let nextA = $('<a></a>').get(0);

    nextA.appendChild(document.createTextNode(' 下一页 '));
    nextA.setAttribute('href', 'javascript:void(0)');
    nextA.onclick = this.pagerDelegate(this, this.callback, { mode: 'next' });

    nextLi.appendChild(nextA);
    _containerUl.appendChild(nextLi);
    _containerUl.appendChild(document.createTextNode(' '));

    // 末页
    let lastLi = $('<li></li>').get(0);
    let lastA = $('<a></a>').get(0);

    lastA.appendChild(document.createTextNode('末页'));
    lastA.setAttribute('href', 'javascript:void(0)');
    lastA.onclick = this.pagerDelegate(this, this.callback, { mode: 'last' });

    lastLi.appendChild(lastA);
    _containerUl.appendChild(lastLi);
    _containerUl.appendChild(document.createTextNode(' '));

    // 页码输入框
    let txtLi = $('<li></li>').get(0);
    let txtSpan = $('<span></span>').get(0);

    $(txtSpan).addClass('pageinput');
    txtLi.appendChild(txtSpan);
    let txtGo = $('<INPUT />').get(0);

    $(txtGo).addClass('pagetxt');
    txtGo.setAttribute('type', 'text');
    txtGo.setAttribute('name', 'gopage');
    txtGo.setAttribute('id', 'gopage');
    txtGo.setAttribute('size', '2');
    txtGo.setAttribute('value', this.pageIndex + '');
    txtGo.onchange = this.pagerDelegate(this, this.handleTextChanged, { objRef: txtGo });

    txtSpan.appendChild(txtGo);

    // Go按钮
    let btnGo = $('<a></a>').get(0);
    btnGo.setAttribute('href', 'javascript:void(0)');
    btnGo.appendChild(document.createTextNode(' GO '));

    btnGo.onclick = this.pagerDelegate(this, this.callback, { mode: 'inputnums' });
    txtSpan.appendChild(btnGo);
    _containerUl.appendChild(txtLi);
    _containerUl.appendChild(document.createTextNode(''));

    _container.appendChild(_containerUl);
  }

  public setInterval(): void {
    this.interval = arguments[0];
    this.absdiff = (this.interval - 1) / 2;
  }

  public setRecordCount(): void {
    this.recordCount = arguments[0];
    
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
  }

  public moveIndicator(): void {
    if (arguments.length !== 1 || arguments[0] == null || arguments[0].mode == null) {
      return;
    }

    switch (arguments[0].mode) {
        case 'first':
            this.pageIndex = 1;

            break;
        case 'previous':
            this.pageIndex -= 1;
            if (this.pageIndex < 1) {
              this.pageIndex = 1;
            }
            break;
        case 'next':
            this.pageIndex += 1;

            if (this.pageIndex > this.pagecount) {
              this.pageIndex = this.pagecount;
            }
            break;
        case 'last':
            this.pageIndex = this.pagecount;
            break;
        case 'nums':
            this.pageIndex = arguments[0].val;
            break;
        case 'inputnums':
            this.pageIndex = this.temppage;
            break;
        default: break;
    }

    if (this.condition && this.condition.pageIndex) {
        this.flag = true;

        this.condition.pageIndex = this.pageIndex;

        let pageHash = '#' + this.pref + 'page' + this.pageIndex.toString();
        location.hash = pageHash;
        // window.navigator.userAgent.toLowerCase().indexOf('msie') > -1 
        // ? $.locationHash(pageHash) : location.hash = pageHash;
    }
  }
}
