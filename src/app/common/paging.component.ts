import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Location } from '@angular/common';

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
           <input class='pagetxt' type='text' 
            [(ngModel)]='goPageIndex' 
            (keydown.enter)='goPage()' size='2' value='1'>
           <a href='javascript:void(0)' (click)='goPage()'> GO </a>
         </span>
       </li>
     </ul>
   </div>
 `
})
export class PagingComponent {
  
  @Input() public pageSize: number;
  @Input() public interval: number = 3;
  @Input() public isHiddenWhenEmpty: boolean = true;
  @Input() public isModifyHash: boolean = true;
  @Input() public condition: any;

  public pageIndex: number;
  public recordCount: number = 0;
  public goPageIndex: number = 1;
 
  public pagecount: number = 0;
  public displayPages: number[] = [];
  @Output() public pageChange: EventEmitter<number> = new EventEmitter<number>();

  public constructor(private location: Location) {}

  public goPage() {
    if (this.goPageIndex <= 0 ) {
      this.goPageIndex = 1;
    }
    if (this.goPageIndex > this.pagecount) {
      this.goPageIndex = this.pagecount;
    }

    let index = this.goPageIndex;
    this.pageChange.emit(+index);
    // this.render(index, this.recordCount);
  }

  public pagex(e) {
    let p = e.target;
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
    
    // this.render(index, this.recordCount);
    this.pageChange.emit(index);
  }

  public render(currIndex: number, allCount: number) {
    this.recordCount = allCount;
    this.pagecount = Math.ceil(allCount / this.pageSize);
    this.pageIndex = currIndex;
    this.goPageIndex = this.pageIndex;
    
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

    if (!this.isModifyHash) {
      return;
    }
    let arr = location.hash.split('/page/');

    if (arr.length === 2) {
      arr.pop();
    }
    // 如果pageIndex=1 则不需要显示/page/1
    if (this.pageIndex === 1) {
      // 只修改hash值 不跳转页面
      this.location.go(arr[0].slice(1));
    } else {
      arr.push(this.pageIndex + '');
      this.location.go(arr.join('/page/').slice(1));
    }
  }
}
