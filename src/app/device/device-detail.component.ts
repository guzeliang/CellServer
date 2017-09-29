import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params , Router }   from '@angular/router';
import { Headers, Http, Response } from '@angular/http';

import { SysStatusEnum } from './SysStatusEnum';
import 'tween.js';
import * as _ from 'underscore';
import * as $ from 'jquery';

// let styles = String(require('./device-detail.component.css'));
// require('../../assets/images/isrunning_false.jpg');
// require('../../assets/images/isrunning_true.jpg');
import '../../assets/images/isrunning_false.jpg';
import '../../assets/images/isrunning_true.jpg';

@Component({
    selector: 'detail',
     styleUrls: [ './device-detail.component.css' ],
    templateUrl: 'device-detail.component.html'
})
export class DeviceDetailComponent implements OnInit, OnDestroy {
  public inCoords = { x: 100, y: 192 };
  public outCoords = { x: 155, y: 22 };
  public tweenIn1: TWEEN.Tween;
  public tweenIn2: TWEEN.Tween;
  public tweenIn3: TWEEN.Tween;
  public tweenIn4: TWEEN.Tween;
  public tweenOut1: TWEEN.Tween;
  public tweenOut2: TWEEN.Tween;
  public tweenOut3: TWEEN.Tween;
  public tweenOut4: TWEEN.Tween;
  public tweenRocker1: TWEEN.Tween;
  public tweenRocker2: TWEEN.Tween;
  public websocket: WebSocket = null;
  public params: any = {};
  public _this: DeviceDetailComponent;
  public Model: any = {
    Id: '',
    CurrStatus: 'Unknown',
    Temperature: 0,
    Description: '',
    CurrVolume: 0,
    Rocker: {
        Speed: 0,
        Angle: 0,
        IsRocking: false
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
    this.Model.Temperature = data.Temperature;
    
    this.Model.Rocker.Speed = data.Rocker.Speed;
    this.Model.Rocker.Angle = data.Rocker.Angle;
    if (this.Model.Rocker.IsRocking !== (data.Rocker.Speed > 0)) {
      this.Model.Rocker.IsRocking = data.Rocker.Speed > 0;

      if (this.Model.Rocker.IsRocking) {
          this.tweenRocker1.start();
      } else {
          this.tweenRocker1.stop();
      }
    }

    this.Model.In.CurrFlowRate = data.In.CurrFlowRate;
    this.Model.In.StatusInfo = data.In.StatusInfo || '';

    if (this.Model.In.IsRunning !== !!data.In.IsRunning) {
      this.Model.In.IsRunning = !!data.In.IsRunning;
      if (this.Model.In.IsRunning) {
          this.tweenIn1.start();
      } else {
          this.tweenIn1.stop();
      }
    }

    this.Model.Out.CurrFlowRate = data.Out.CurrFlowRate;
    this.Model.Out.StatusInfo = data.Out.StatusInfo || '';

    if (this.Model.Out.IsRunning !== !!data.Out.IsRunning) {
      this.Model.Out.IsRunning = !!data.Out.IsRunning;

      if (this.Model.Out.IsRunning) {
          this.tweenOut1.start();
      } else {
          this.tweenOut1.stop();
      }
    }
  } 

  public ngOnInit() { 
      this.route.params.forEach( (param: Params) => {
          _.extend(this.params, param);
      });
      this.initWS();
      this.initPumpInAnimate();
      this.initPumpOutAnimate();
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
      this.tweenIn1.stop();
      this.inCoords = { x: 100, y: 192 };
  }

  public stopPumpOutAnimate() {
    this.tweenOut1.stop();
    this.outCoords = { x: 155, y: 22 };
      
    $('#pumpOutRun').css({
      top: 22,
      right: 155
    });
  }

  public stopRockerAnimate() {
      this.tweenRocker1.stop();
  }

  public initPumpInAnimate() {
      let _this = this;
      this.tweenIn1 = new TWEEN.Tween(this.inCoords)
        .to({ x: 116, y: 192 }, 500)
        .onStop(function() {
            _this.inCoords = { x: 100, y: 192 };
            this.y = _this.inCoords.y;
            this.x = _this.inCoords.x;
            $('#pumpInRun').css({
                top: this.y,
                left: this.x
            });
        })
        .onUpdate(function() {
            $('#pumpInRun').css({
                top: this.y,
                left: this.x
            });
        });
      this.tweenIn2  = new TWEEN.Tween(this.inCoords)
        .to({ x: 116, y: -6 }, 2000)
        .onStop(function() {
          _this.inCoords = { x: 100, y: 192 };
          this.y = _this.inCoords.y;
          this.x = _this.inCoords.x;
          $('#pumpInRun').css({
              top: this.y,
              left: this.x
          });
        })
        .onUpdate(function() {
          $('#pumpInRun').css({
              top: this.y,
              left: this.x
          });
        });

      this.tweenIn3  = new TWEEN.Tween(this.inCoords)
        .to({ x: 155, y: -6 }, 500)
        .onStop(function() {
          _this.inCoords = { x: 100, y: 192 };
          this.y = _this.inCoords.y;
          this.x = _this.inCoords.x;
          $('#pumpInRun').css({
              top: this.y,
              left: this.x
          });
        })
        .onUpdate(function() {
          $('#pumpInRun').css({
              top: this.y,
              left: this.x
          });
        });

      this.tweenIn4  = new TWEEN.Tween(this.inCoords)
        .to({ x: 155, y: 22 }, 500)
        .onComplete(function() {
          _this.inCoords = { x: 100, y: 192 };
          this.y = _this.inCoords.y;
          this.x = _this.inCoords.x;
          $('#pumpInRun').css({
              top: this.y,
              left: this.x
          });

          _this.tweenIn1.delay(500).start();
        })
        .onStop(function() {
          _this.inCoords = { x: 100, y: 192 };
          this.y = _this.inCoords.y;
          this.x = _this.inCoords.x;
          $('#pumpInRun').css({
              top: this.y,
              left: this.x
          });
        })
        .onUpdate(function() {
          $('#pumpInRun').css({
              top: this.y,
              left: this.x
          });
        });

      _this.tweenIn1.chain(_this.tweenIn2);
      _this.tweenIn2.chain(_this.tweenIn3);
      _this.tweenIn3.chain(_this.tweenIn4);
  }

  public initPumpOutAnimate() {
      let _this = this;
      this.tweenOut1 = new TWEEN.Tween(this.outCoords)
        .to({ x: 155, y: -6 }, 500)
        .onStop(function() {
          _this.outCoords =  { x: 155, y: 22 };
          this.y = _this.outCoords.y;
          this.x = _this.outCoords.x;
          $('#pumpOutRun').css({
              top: 192,
              right: 100
          });
        })
        .onUpdate(function() {
          $('#pumpOutRun').css({
              top: this.y,
              right: this.x
          });
        });
      this.tweenOut2 = new TWEEN.Tween(this.outCoords)
        .to({ x: 116, y: -6 }, 500)
        .onStop(function() {
          _this.outCoords =  { x: 155, y: 22 };
          this.y = _this.outCoords.y;
          this.x = _this.outCoords.x;
          $('#pumpOutRun').css({
              top: 192,
              right: 100
          });
        })
        .onUpdate(function() {
          $('#pumpOutRun').css({
              top: this.y,
              right: this.x
          });
        });

      this.tweenOut3 = new TWEEN.Tween(this.outCoords)
          .to({ x: 116, y: 192 }, 2000)
          .onStop(function() {
            _this.outCoords =  { x: 155, y: 22 };
            this.y = _this.outCoords.y;
            this.x = _this.outCoords.x;
            $('#pumpOutRun').css({
                top: 192,
                right: 100
            });
          })
          .onUpdate(function() {
            $('#pumpOutRun').css({
                top: this.y,
                right: this.x
            });
          });

      this.tweenOut4 = new TWEEN.Tween(this.outCoords)
        .to({ x: 100, y: 192 }, 500)
        .onStop(function() {
          _this.outCoords =  { x: 155, y: 22 };
          this.y = _this.outCoords.y;
          this.x = _this.outCoords.x;
          $('#pumpOutRun').css({
              top: 192,
              right: 100
          });
        })
        .onComplete(function() {
          _this.outCoords =  { x: 155, y: 22 };
          this.y = _this.outCoords.y;
          this.x = _this.outCoords.x;
          $('#pumpOutRun').css({
              top: 192,
              right: 100
          });

          _this.tweenOut1.delay(500).start();
        })
        .onUpdate(function() {
          $('#pumpOutRun').css({
              top: this.y,
              right: this.x
          });
        });

      this.tweenOut1.chain(this.tweenOut2);
      this.tweenOut2.chain(this.tweenOut3);
      this.tweenOut3.chain(this.tweenOut4);    
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
                      _this.updateBox(  $('#rockerTop').get(0), this );
                  });
      
      this.tweenRocker1.chain(this.tweenRocker2);
      this.tweenRocker2.chain(this.tweenRocker1);
  }

  public updateBox(box: HTMLElement, params: any) {
    let s = box.style;
    let transform = 'rotate(' + Math.floor( params.rotation ) + 'deg)';
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
