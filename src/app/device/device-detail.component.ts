import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params , Router }   from '@angular/router';
import { Headers, Http, Response } from '@angular/http';

import { SysStatusEnum } from './SysStatusEnum';
import  * as TWEEN from '@tweenjs/tween.js';
import * as _ from 'underscore';
import * as $ from 'jquery';

import '../../assets/images/isrunning_false.jpg';
import '../../assets/images/isrunning_true.jpg';

@Component({
  selector: 'detail',
  styleUrls: [ './device-detail.component.css' ],
  templateUrl: 'device-detail.component.html'
})
export class DeviceDetailComponent implements OnInit, OnDestroy {
  public tweenIn1: TWEEN.Tween;
  public tweenOut1: TWEEN.Tween;
  public tweenRocker1: TWEEN.Tween;
  public tweenRocker2: TWEEN.Tween;
  public websocket: WebSocket = null;
  public params: any = {};
  public _this: DeviceDetailComponent;
  public Model: any = {
    Id: '',
    CurrStatus: 'Unknown',
    Temperature: {
      Temperature: 0
    },
    Description: '',
    CurrVolume: 0,
    Rocker: {
      Speed: 0,
      Angle: 0,
      IsRocking: false
    },
    Gas: {
      IsEnabled: true,
      FlowRate: 400,
      Concentration: 5.2
    },
    In: {
      PumpId: 1,
      Direction: 0,
      CurrFlowRate: 0,
      IsRunning: false,
      img: '/images/isrunning_false.jpg',
      StatusInfo: null
    },
    Out: {
      PumpId: 3,
      Direction: 1,
      CurrFlowRate: 0,
      IsRunning: false,
      img: '/images/isrunning_false.jpg',
      StatusInfo: null
    }
  };
  constructor(
    private _router: Router,
    private route: ActivatedRoute
  ) {}

  public initWS() {
    let _this = this;
    let id = _this.params['id'];
    
    let port = process.env.PORT || location.port;
    this.websocket = new WebSocket(`ws://${location.hostname}:${port}`);

    this.websocket.onopen = function(evt){
      console.log('open');
      
      this.send(JSON.stringify({
        action: 'browser_first_conn', 
        data: {
          clientId: id
        }
      }));
    };
    this.websocket.onclose = (evt) => {
        console.log('onclose');
    };
    this.websocket.onmessage = (evt) => {
      try {
        let data = JSON.parse(evt.data);
        console.log(data);
        switch (data.action) {
          case 'syncData': {
            _this.render(data.data);
            break;
          }
          case 'execCmdFailed' : {
            alert('命令执行失败');
            break;
          }
          case 'qr': {
            $('#qrInfo').show();
            break;
          }
          default: break;
        }
      } catch (e) {
        console.log(e.message);
      }
    };
    this.websocket.onerror = (evt) => {
      console.log('onerror');
    };
  }

  public render(data: any) {
    if (typeof(data) !== 'object') {
      data = JSON.parse(data);
    }

    if (data.CurrStatus === SysStatusEnum.Discarded) {
      return this._router.navigate([`/iot/edit/v/${this.params.id}/${this.params.desc}`]);
    }

    this.switchCommand(data.CurrStatus);
    
    this.Model.CurrStatus = data.CurrStatus;
    this.Model.CurrVolume = data.CurrVolume;
    this.Model.Temperature.Temperature = _.isObject(data.Temperature) 
      ? data.Temperature.Temperature : data.Temperature;
    
    this.Model.Rocker.Speed = data.Rocker.Speed;
    this.Model.Rocker.Angle = data.Rocker.Angle;
    if (this.Model.Rocker.IsRunning !== (data.Rocker.Speed > 0)) {
      this.Model.Rocker.IsRunning = data.Rocker.Speed > 0;

      if (this.Model.Rocker.IsRunning) {
        this.tweenRocker1.start();
      } else {
        this.tweenRocker1.stop();
      }
    }

    this.Model.In.CurrFlowRate = data.In.RealTimeFlowRate;
    this.Model.In.StatusInfo = data.In.StatusInfo || '';

    if (this.Model.In.IsRunning !== !!data.In.IsRunning) {
      this.Model.In.IsRunning = !!data.In.IsRunning;
      if (this.Model.In.IsRunning) {
        this.startPumpInAnimate();
      } else {
        this.stopPumpInAnimate();
      }
    }

    this.Model.Out.CurrFlowRate = data.Out.RealTimeFlowRate;
    this.Model.Out.StatusInfo = data.Out.StatusInfo || '';

    if (this.Model.Out.IsRunning !== !!data.Out.IsRunning) {
      this.Model.Out.IsRunning = !!data.Out.IsRunning;

      if (this.Model.Out.IsRunning) {
        this.startPumpOutAnimate();
      } else {
        this.stopPumpOutAnimate();
      }
    }
  } 

  public ngOnInit() { 
    this.route.params.forEach( (param: Params) => {
      _.extend(this.params, param);
    });
    this.initWS();
    this.initRockerAnimate();
    window.setInterval(this.animate, 16);
  }

  public ngOnDestroy(): void {
    if (this.websocket) {
      this.websocket.close();
    }

    this.stopPumpInAnimate();
    this.stopPumpOutAnimate();
    this.stopRockerAnimate();
  }

  public animate(time: number) {
    TWEEN.update(time);
  }

  public stopPumpInAnimate() {
    if (this.tweenIn1) {
      this.tweenIn1.stop();
    }
  }

  public stopPumpOutAnimate() {
    if (this.tweenOut1) {
      this.tweenOut1.stop();
    }
  }

  public stopRockerAnimate() {
    this.tweenRocker1.stop();
  }

  public transformAnimate(end, time, element, start) {
    let coords = start; 
    let _this = this;
    return new Promise(function(resolve, reject) {
      _this.tweenIn1 = new TWEEN.Tween(coords) 
        .to(end, time) 
        .onUpdate(function() { 
          $(element).css({ top: coords.y, left: coords.x });
        })
        .onStop(function() {
          reject(new Error('stop'));
        })
        .onComplete(function() {
          resolve(coords);
        })
        .start();
    });
  }

  public transformOutAnimate(end, time, element, start) {
    let coords = start; 
    let _this = this;
    return new Promise(function(resolve, reject) {
      _this.tweenOut1 = new TWEEN.Tween(coords) 
        .to(end, time) 
        .onUpdate(function() { 
          $(element).css({ top: coords.y, right: coords.x });
        })
        .onStop(function() {
          reject(new Error('stop'));
        })
        .onComplete(function() {
          console.log('onComplete');
          resolve(coords);
        })
        .start();
    });
  }

  public startPumpInAnimate() {
    let xcoords = { x: 100, y: 192 }; 
    let ele = document.getElementById('pumpInRun');
    let _this = this;
    this.transformAnimate({ x: 116, y: 192 }, 300, ele, xcoords)
    .then(_this.transformAnimate.bind(_this, { x: 116, y: -6 }, 2000, ele))
    .then(_this.transformAnimate.bind(_this, { x: 155, y: -6 }, 500, ele))
    .then(_this.transformAnimate.bind(_this, { x: 155, y: 22 }, 500, ele))
    .then(function(ret) {
      console.log('end');
      _this.startPumpInAnimate();
    }).catch(function(err) {
      console.log('err' + err.message);
      $(ele).css({ top: 192, left: 100 });
    });
  }

  public startPumpOutAnimate() {
    let xcoords = { x: 155, y: 22 }; 
    let ele = document.getElementById('pumpOutRun');
    let _this = this;
    this.transformOutAnimate({ x: 155, y: -6 }, 300, ele, xcoords)
    .then(_this.transformOutAnimate.bind(_this, { x: 116, y: -6 }, 500, ele))
    .then(_this.transformOutAnimate.bind(_this, { x: 116, y: 192 }, 2000, ele))
    .then(_this.transformOutAnimate.bind(_this, { x: 100, y: 192 }, 500, ele))
    .then(function(ret) {
      _this.startPumpOutAnimate();
    }).catch(function(err) {
      $(ele).css({ top: 192, right: 100 });
    });
  }

  public initRockerAnimate() {
    let _this = this;
    this.tweenRocker1 = new TWEEN.Tween( $('#rockerTop').get(0).dataset )
      .to( { rotation: 8 }, 1000 )
      .onUpdate( function() {
        _this.updateBox( $('#rockerTop').get(0), this );
      });
    this.tweenRocker2 = new TWEEN.Tween( $('#rockerTop').get(0).dataset )
      .to( { rotation: -8 }, 1000 )
      .onUpdate( function() {
        _this.updateBox( $('#rockerTop').get(0), this );
      });
    
    this.tweenRocker1.chain(this.tweenRocker2);
    this.tweenRocker2.chain(this.tweenRocker1);
  }

  public updateBox(box: HTMLElement, params: any) {
    if (!box  || !box.style ) {
      return;
    }

    let s = box.style;
    let transform = 'rotate(' + Math.floor( (<any> box.dataset).rotation ) + 'deg)';
    s.webkitTransform = transform;
    // s.mozTransform = transform;
    s.transform = transform;
  }

  public start() {
    this.websocket.send(JSON.stringify({action: 'command', data: 'start'}));
  }

  public pause() {
    this.websocket.send(JSON.stringify({action: 'command', data: 'pause'}));
  }

  public restart() {
    this.websocket.send(JSON.stringify({action: 'command', data: 'restart'}));
  }

  public switchCommand(status: any): void {
    switch (status) {
      case SysStatusEnum.Unknown:
      case SysStatusEnum.Discarding:
      case SysStatusEnum.Discarded:
      case SysStatusEnum.Starting:
      case SysStatusEnum.Pausing:
      case SysStatusEnum.Completed: {
        $('#btnStart').attr('disabled', 'disabled');
        $('#btnPauseLH').attr('disabled', 'disabled');
        $('#btnPauseAll').attr('disabled', 'disabled');
      } break;

      case SysStatusEnum.Ready: {
        $('#btnStart').removeAttr('disabled');

        $('#btnPauseLH').attr('disabled', 'disabled');
        $('#btnPauseAll').attr('disabled', 'disabled');
      } break;

      case SysStatusEnum.Paused: {
        $('#btnStart').removeAttr('disabled');
        $('#btnPauseLH').attr('disabled', 'disabled');
        $('#btnPauseAll').attr('disabled', 'disabled');
      } break;

      case SysStatusEnum.Running: {
          $('#btnStart').attr('disabled', 'disabled');
          $('#btnPauseLH').removeAttr('disabled');
          $('#btnPauseAll').removeAttr('disabled');
      } break;

      default:
        break;
  }
  }
}
