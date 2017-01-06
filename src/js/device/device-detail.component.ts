import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Headers, Http, Response} from '@angular/http';

import {SysStatusEnum} from './SysStatusEnum';
let styles = String(require('./device-detail.component.css'));
var $ = require('jquery');
require('../../images/isrunning_false.jpg');
require('../../images/isrunning_true.jpg');

@Component({
    selector: 'detail',
     styleUrls: [ styles ],
    templateUrl: 'device-detail.component.html'
})
export class DeviceDetailComponent implements OnInit {
    websocket:WebSocket = null;
    params:any = {};
    _this:DeviceDetailComponent;
    Model:any = {
        Id: '',
        CurrStatus: 'Unknown',
        Temperature: 0,
        Description: '',
        CurrVolume: 0,
        Rocker: {
            "Speed": 0,
            "Angle": 0,
            "IsRocking": false
        },
        In: {
            PumpId: 1,
            Direction: 0,
            CurrFlowRate: 0,
            IsRunning: false,
            img:'/images/isrunning_false.jpg',
            StatusInfo: null
        },
        Out: {
            PumpId: 3,
            Direction: 1,
            CurrFlowRate: 0,
            IsRunning: false,
            img:'/images/isrunning_false.jpg',
            StatusInfo: null
        }
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
                    case 'syncData' :{
                        _this.render(data.data);
                        break;
                    }
                    case 'execCmdFailed' : {
                        alert('命令执行失败');
                        break;
                    }
                    default:break;
                }
            } catch(e) {
                
            }
        };
        this.websocket.onerror = function(evt) {
            console.log('onerror');
        };
    }

    render(data:any) {
         if (typeof(data) !== 'object')
                data = JSON.parse(data);
    
        if (data.CurrStatus === SysStatusEnum.Discarded) {
            return location.href = `/iot/edit/v/${this.params.id}/${this.params.desc}`;
        }
    
        this.switchCommand(data.CurrStatus);
        
        this.Model.CurrStatus = data.CurrStatus;
        this.Model.CurrVolume = data.CurrVolume;
        this.Model.Temperature = data.Temperature;
        this.Model.Rocker.Speed = data.Rocker.Speed;
        this.Model.Rocker.Angle = data.Rocker.Angle;
        this.Model.In.CurrFlowRate = data.In.CurrFlowRate;
        this.Model.In.StatusInfo = data.In.StatusInfo || '';
        this.Model.In.img = '/images/isrunning_' + !!data.In.IsRunning + '.jpg';

        this.Model.Out.CurrFlowRate = data.Out.CurrFlowRate;
        this.Model.Out.StatusInfo = data.Out.StatusInfo || '';
        this.Model.Out.img = '/images/isrunning_' + !!data.Out.IsRunning + '.jpg';
    } 

    ngOnInit() { 
        this.route.params.forEach( (param:Params) => {
            _.extend(this.params, param);
        });
        this.initWS();
    }

    start() {
        this.websocket.send(JSON.stringify({action:'command', data:'start'}));
    }

    pause() {
        this.websocket.send(JSON.stringify({action:'command', data:'pause'}));
    }

    restart() {
        this.websocket.send(JSON.stringify({action:'command', data:'restart'}));
    }

    switchCommand(status:any):void {
    switch (status) {
        case SysStatusEnum.Unknown:
        case SysStatusEnum.Discarding:
        case SysStatusEnum.Discarded:
        case SysStatusEnum.Starting:
        case SysStatusEnum.Pausing:
        case SysStatusEnum.Completed:
            {
                $('#btnStart').attr('disabled', 'disabled');
                $('#btnPauseLH').attr('disabled', 'disabled');
                $('#btnPauseAll').attr('disabled', 'disabled');
            }
            break;

        case SysStatusEnum.Ready:
            {
                $('#btnStart').removeAttr('disabled');

                $('#btnPauseLH').attr('disabled', 'disabled');
                $('#btnPauseAll').attr('disabled', 'disabled');
            }
            break;

        case SysStatusEnum.Paused:
            {
                $('#btnStart').removeAttr('disabled');
                $('#btnPauseLH').attr('disabled', 'disabled');
                $('#btnPauseAll').attr('disabled', 'disabled');
            }
            break;

        case SysStatusEnum.Running:
            {
                $('#btnStart').attr('disabled', 'disabled');
                $('#btnPauseLH').removeAttr('disabled');
                $('#btnPauseAll').removeAttr('disabled');
            }
            break;
        default:
            break;
    }
}
}