import { Component, OnInit, OnDestroy } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { Rocker } from './Rocker';
import { Gas } from './Gas';
import { TemperatureGauge } from './TemperatureGauge';
import { PumpViewModel } from './PumpViewModel';
import * as moment from 'moment';
import * as _ from 'underscore';

@Component({
    selector: 'edit',
    templateUrl: './device-edit.component.html'
})
export class EditComponent implements OnInit, OnDestroy {
    public params: any = {};
    public Description: string;
    public Name: string;
    public UserName: string;
    public Cell: string;
    public Rocker: Rocker = {
        IsEnabled: true,
        Speed: 5,
        Angle: 10
    };
    public Gas: Gas = {
        IsEnabled: true,
        FlowRate: 500,
        Concentration: 0
    };
    public TemperatureGauge: TemperatureGauge = {
      IsEnabled : true,
      Level: 2,
      Temperature: 37
    };
    public IsGasEnabled: boolean;
    public websocket: WebSocket = null;
    public In: PumpViewModel = {
      PumpId: 1,
      PumpName: 'Pump 1',
      StartTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      EndTime: moment().add(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
      Direction: 'Anticlockwise',
      InOrOut : 0,
      InitialVolume: 10,
      InitialFlowRate: 5,
      IsUseabled: true,
      ProcessMode: 'SingleMode',
      Period: 5,
      FirstSpan: 5,
      Volume: 5,
      FlowRate: 5
    };
    public Out: PumpViewModel = {
      PumpId: 3,
      PumpName: 'Pump 3',
      StartTime: moment().add(2, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      EndTime: moment().add(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
      Direction: 'Clockwise',
      InOrOut : 1,
      InitialVolume: 5,
      InitialFlowRate: 5,
      IsUseabled: true,
      ProcessMode: 'SingleMode',
      Period: 5,
      FirstSpan: 5,
      Volume: 5,
      FlowRate: 5
    };

    constructor(
        private _router: Router,
        private route: ActivatedRoute
    ) {}

    public initWS() {
        let _this = this;
        console.log(process.env);
        let port = process.env.PORT || location.port;
        this.websocket = new WebSocket(`ws://${location.hostname}:${port}`);
        this.websocket.onopen = function(evt) {
          console.log('open');
          let id = _this.params['id'];
          
          this.send(JSON.stringify({
            action: 'browser_first_conn', 
            data: {
            clientId: id
          }}));
        };
        this.websocket.onclose = function(evt) {
          console.log('onclose');
        };
        this.websocket.onmessage = function(evt) {
            try {
              let data = JSON.parse(evt.data);
              switch (data.action) {
                case 'saveScheduleBack': {
                    if (data.data && data.data.code === 'success') {
                        _this._router.navigate(['/iot/detail/v' +
                        `/${_this.params['id']}/${_this.params['desc']}`]);
                    } else {
                        alert(data.data.code);
                    }
                } break;
                default: break;
              }
            } catch (e) {
              console.log(e.message);
            }
            console.log('message->' + evt.data);
        };

        this.websocket.onerror = function(evt) {
            console.log('onerror');
        };
    }

    public ngOnInit() { 
      this.route.params.forEach( (param: Params) => {
          _.extend(this.params, param);
      });
      this.initWS();
    }

    public ngOnDestroy() {
      if (this.websocket) {
          this.websocket.close();
      }
    }

    public save(): void {
      let datax = {
          Description: this.Description || '',
          Name: this.Name || '',
          UserName: this.UserName || '',
          Cell: this.Cell || '',
          Rocker: this.Rocker || {},
          Gas: this.Gas || {},
          TemperatureGauge : this.TemperatureGauge || {},
          In: this.In ,
          Out: this.Out 
      };

      this.websocket.send(JSON.stringify({action: 'saveSchedule', data: datax}));
    }

    public monitor(): void {
      this._router.navigate([`/iot/detail/v/${this.params['id']}/${this.params['desc']}`]);
    }

    public back(): void {
        history.back();
    }

    public setMode(mode: string, flag: string) {
       this[flag].ProcessMode = mode;
       return false;
    }
}
