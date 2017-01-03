import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response, URLSearchParams, QueryEncoder } from '@angular/http';
import { NgIf, NgFor} from '@angular/common';
import {Rocker} from './Rocker';
import {PumpViewModel} from './PumpViewModel';
import * as moment from 'moment';

@Component({
    selector: 'edit',
    templateUrl: './device-edit.component.html'
})
export class EditComponent implements OnInit {
    Description:string;
    Name:string;
    UserName:string;
    Cell:string;
    Rocker:Rocker = {
        IsEnabled: false,
        Speed: 5,
        Angle: 10
    };
    IsTemperatureEnabled :boolean;
    websocket:WebSocket = null;
    In:PumpViewModel = {
            PumpId: 1,
            PumpName: 'Pump 1',
            StartTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            EndTime: moment().add(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
            Direction: 'In',
            InitialVolume: 10,
            InitialFlowRate: 5,
            IsUseabled: true,
            ProcessMode: 'SingleMode'
        };
    Out:PumpViewModel={
            PumpId: 3,
            PumpName: 'Pump 3',
            StartTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            EndTime: moment().add(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
            Direction: 'Out',
            InitialVolume: 5,
            InitialFlowRate: 5,
            IsUseabled: true,
            ProcessMode: 'SingleMode'
        };

    constructor() { }

    initWS(){
        this.websocket = new WebSocket('ws://192.168.1.110:8103');
        this.websocket.onopen = function(evt) {
            console.log('open');
            var params:any = new URLSearchParams(location.search.slice(1));
            var id = params.get('id');
            var data = {
                clientId: id
            };
            this.send(JSON.stringify({action:'browser_first_conn', data:data}));
        };
        this.websocket.onclose = function(evt) {
            console.log('onclose');
        };
        this.websocket.onmessage = function(evt) {
            try {
                var data = JSON.parse(evt.data);
                console.log(data)
                switch(data.action) {
                    case 'saveScheduleBack' :{
                        if (data.data && data.data.code == 'success') {
                            location.href = '/iot/detail/v' + location.search;
                        } else {
                            alert(data.data.code)
                            //common.popBy('#btnSave', data.code);
                        }
                    }break;
                    default:break;
                }
            } catch(e) {
                
            }
            console.log('message->' + evt.data);
        }
        this.websocket.onerror = function(evt) {
            console.log('onerror');
        };
    }

    ngOnInit() { 
        this.initWS();
    }

    save():void {
        var data = {
            Description: this.Description || '',
            Name: this.Name || '',
            UserName: this.UserName || '',
            Cell: this.Cell || '',
            Rocker: this.Rocker || {},
            IsTemperatureEnabled: this.IsTemperatureEnabled || false,
            In: this.In ,
            Out: this.Out 
        }
        this.websocket.send(JSON.stringify({action:'saveSchedule', data:data}))
    }

    monitor():void {
        location.href = '/iot/detail/v' + location.search;
    }

    back():void {
        history.back();
    }
}