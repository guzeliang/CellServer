import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import {Device} from './device';
import {DeviceService} from './device.service';

@Component({
    selector: 'devices',
    templateUrl: './devices.component.html'
})
export class DevicesComponent implements OnInit {
    devices: Device[];
    recordCount:number;
    pageSize:number = 5;
    pageIndex:number = 1;
    searchWord:string="";

    constructor( private http:Http, private service:DeviceService) {
    }
    
    search() {
        this.pageIndex=1;
        this.service.page({pagesize:this.pageSize, pageindex:this.pageIndex, keyword:this.searchWord})
            .then( res => {
                    this.devices = res.json().result as Device[];
                    this.recordCount = res.json().total;
            }).catch(err => console.log(err.message || err))
    }
    
    remove(device:Device, evt:any) {
        this.service.delete(device.id).then(res => {
            this.devices = _.reject(this.devices, (each) => {
            return each.id === device.id;
            })
        }).catch(err => {
            console.log(err.message || err)
        })
    }
    
    pageChange(pageIndex:number) {
        this.pageIndex = pageIndex;
        this.service.page({pagesize:this.pageSize, pageindex:pageIndex, keyword:this.searchWord})
            .then( res => {
                    this.devices = res.json().result as Device[];
                    this.recordCount = res.json().total;
                })
            .catch(err => console.log(err.message || err))
    }
    
    ngOnInit(): void {
        document.title="hello world";
        this.service.page({pagesize:this.pageSize, pageindex:this.pageIndex})
            .then( res => {
                    this.devices = res.json().result as  Device[];
            this.recordCount = res.json().total;
                })
            .catch(err => console.log(err.message || err))
        }
}