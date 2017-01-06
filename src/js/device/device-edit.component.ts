import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { ActivatedRoute, Params}   from '@angular/router';
import { NgIf, NgFor} from '@angular/common';
import {Rocker} from './Rocker';
import {PumpViewModel} from './PumpViewModel';
import * as moment from 'moment';

@Component({
    selector: 'edit',
    templateUrl: './device-edit.component.html'
})
export class EditComponent implements OnInit {
    params:any = {};
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
            ProcessMode: 'SingleMode',
            Period:5,
            FirstSpan:5,
            Volume:5,
            FlowRate:5
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
            ProcessMode: 'SingleMode',
            Period:5,
            FirstSpan:5,
            Volume:5,
            FlowRate:5
        };

    constructor(
        private route: ActivatedRoute
    ) {}

    initWS(){
        var _this = this;

        var port = process.env.PORT || 8103;
        this.websocket = new WebSocket(`ws://${location.hostname}:${port}`);
        this.websocket.onopen = function(evt) {
            console.log('open');
            var id = _this.params['id'];
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
                            location.href = `/iot/detail/v/${_this.params['id']}/${_this.params['desc']}`;
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
        this.route.params.forEach( (param:Params) => {
            _.extend(this.params, param);
        });
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
        location.href = `/iot/detail/v/${this.params['id']}/${this.params['desc']}`;
    }

    back():void {
        history.back();
    }

    setMode(mode:string, flag:string) {
       this[flag].ProcessMode = mode;
       return false;
    }
}