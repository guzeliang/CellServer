import { Component, OnInit, ViewChild } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { ActivatedRoute } from '@angular/router';

import { Device } from './device';
import { DeviceService } from './device.service';
import * as _ from 'underscore';

@Component({
    selector: 'devices',
    templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
    public devices: Device[];
    public recordCount: number;
    public pageSize: number = 10;
    public pageIndex: number = 1;
    public searchWord: string= '';

    @ViewChild('pager') public  pager;

    constructor(private http: Http, private route: ActivatedRoute,  private service: DeviceService
      ) {
    }
    
    public search() {
      this.pageIndex = 1;
      this.service.page({
        pagesize: this.pageSize, 
        pageindex: this.pageIndex, 
        keyword: this.searchWord
      }).then( (res) => {
        this.devices = res.json().result as Device[];
        this.recordCount = res.json().total;
        this.pager.render(this.pageSize, this.recordCount);
      }).catch((err) => console.log(err.message || err));
    }
    
    public remove(device: Device, evt: any) {
        this.service.delete(device.id).then((res) => {
            this.devices = _.reject(this.devices, (each) => {
            return each.id === device.id;
          });
        }).catch((err) => {
            console.log(err.message || err);
        });
    }
    
    public pageChange(pageIndex: number) {
      this.pageIndex = pageIndex;
      this.service.page({
          pagesize: this.pager.pageSize, 
          pageindex: pageIndex, 
          keyword: this.searchWord
        })
        .then((res) => {
            this.devices = res.json().result as Device[];
            this.recordCount = res.json().total;
            this.pager.render(this.pageIndex, this.recordCount);
        }).catch((err) => console.log(err.message || err));
    }
    
    public ngOnInit(): void {
      this.route.params.subscribe((params) => {
        if (params['id'] && +params['id']) {
          this.pageIndex = +params['id'];
          console.log('xxxxx');
        } else {
          this.pageIndex = 1;
        }

        this.service.page({pagesize: this.pager.pageSize, pageindex: this.pageIndex})
        .then((res) => {
          this.devices = res.json().result as  Device[];
          this.recordCount = res.json().total;
          this.pager.render(this.pageIndex, this.recordCount);
        })
        .catch((err) => console.log(err.message || err));
      });
    };
}
