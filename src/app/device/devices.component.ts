import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

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

    constructor( private http: Http, private service: DeviceService) {
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
      this.service.page({pagesize: this.pageSize, pageindex: pageIndex, keyword: this.searchWord})
        .then((res) => {
            this.devices = res.json().result as Device[];
            this.recordCount = res.json().total;
        }).catch((err) => console.log(err.message || err));
    }
    
    public ngOnInit(): void {
      this.service.page({pagesize: this.pageSize, pageindex: this.pageIndex})
          .then((res) => {
            this.devices = res.json().result as  Device[];
            this.recordCount = res.json().total;
          })
          .catch((err) => console.log(err.message || err));
      }
}
