import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Headers, Http, Response} from '@angular/http';

import {SysStatusEnum} from './SysStatusEnum';
import * as TWEEN from 'tween.js';

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
    inCoords = { x: 100, y: 192 };
	outCoords = { x: 175, y: 22 };
    tweenIn1:TWEEN.Tween;
    tweenIn2:TWEEN.Tween;
    tweenIn3:TWEEN.Tween;
    tweenIn4:TWEEN.Tween;
    tweenOut1:TWEEN.Tween;
    tweenOut2:TWEEN.Tween;
    tweenOut3:TWEEN.Tween;
    tweenOut4:TWEEN.Tween;
    tweenRocker1:TWEEN.Tween;
    tweenRocker2:TWEEN.Tween;
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
        if(this.Model.Rocker.IsRocking !== (data.Rocker.Speed > 0)) {
            this.Model.Rocker.IsRocking = data.Rocker.Speed > 0;

            if(this.Model.Rocker.IsRocking) {
                this.tweenRocker1.start();
            } else {
                this.tweenRocker1.stop();
            }
        }

        this.Model.In.CurrFlowRate = data.In.CurrFlowRate;
        this.Model.In.StatusInfo = data.In.StatusInfo || '';

        if(this.Model.In.IsRunning != !!data.In.IsRunning) {
            this.Model.In.IsRunning = !!data.In.IsRunning;

            if(this.Model.In.IsRunning) {
                this.tweenIn1.start();
            } else {
                this.tweenIn1.stop();
            }
        }

        this.Model.Out.CurrFlowRate = data.Out.CurrFlowRate;
        this.Model.Out.StatusInfo = data.Out.StatusInfo || '';

        if(this.Model.Out.IsRunning != !!data.Out.IsRunning) {
            this.Model.Out.IsRunning = !!data.Out.IsRunning;

            if(this.Model.Out.IsRunning) {
                this.tweenOut1.start();
            } else {
                this.tweenOut1.stop();
            }
        }
    } 

    ngOnInit() { 
        this.route.params.forEach( (param:Params) => {
            _.extend(this.params, param);
        });
        this.initWS();
        this.initPumpInAnimate();
        this.initPumpOutAnimate();
        this.initRockerAnimate();
        window.setInterval(this.animate, 16);
    }

    ngOnDestroy() {
        if(this.websocket) {
            this.websocket.close();
        }

        this.stopPumpInAnimate();
        this.stopPumpOutAnimate();
        this.stopRockerAnimate();
    }

    animate(time:number) {
        TWEEN.update(time);
    }

    stopPumpInAnimate() {
        this.tweenIn1.stop();
        this.inCoords = { x: 100, y: 192 };
    }

    stopPumpOutAnimate() {
        this.tweenOut1.stop();
	    this.outCoords = { x: 175, y: 22 };
        
         $('#pumpOutRun').css({
            top:22,
            right:175
        })
    }

    stopRockerAnimate() {
        this.tweenRocker1.stop();
    }

    initPumpInAnimate() {
        var _this = this;
        this.tweenIn1 = new TWEEN.Tween(this.inCoords)
            .to({ x: 136, y: 192 }, 500)
            .onStop(function() {
                 _this.inCoords = { x: 100, y: 192 };
                this.y = _this.inCoords.y;
                this.x = _this.inCoords.x;
                $('#pumpInRun').css({
                    top:this.y,
                    left:this.x
                })
            })
            .onUpdate(function() {
                $('#pumpInRun').css({
                    top:this.y,
                    left:this.x
                })
            })
        this.tweenIn2  = new TWEEN.Tween(this.inCoords)
            .to({ x: 136, y: -6 }, 2000)
            .onStop(function() {
                 _this.inCoords = { x: 100, y: 192 };
                this.y = _this.inCoords.y;
                this.x = _this.inCoords.x;
                $('#pumpInRun').css({
                    top:this.y,
                    left:this.x
                })
            })
            .onUpdate(function() {
                $('#pumpInRun').css({
                    top:this.y,
                    left:this.x
                })
            })

        this.tweenIn3  = new TWEEN.Tween(this.inCoords)
            .to({ x: 175, y: -6 }, 500)
            .onStop(function() {
                 _this.inCoords = { x: 100, y: 192 };
                this.y = _this.inCoords.y;
                this.x = _this.inCoords.x;
                $('#pumpInRun').css({
                    top:this.y,
                    left:this.x
                })
            })
            .onUpdate(function() {
                $('#pumpInRun').css({
                    top:this.y,
                    left:this.x
                })
            })

        this.tweenIn4  = new TWEEN.Tween(this.inCoords)
            .to({ x: 175, y: 22 }, 500)
            .onComplete(function() {
                _this.inCoords = { x: 100, y: 192 };
                this.y = _this.inCoords.y;
                this.x = _this.inCoords.x;
                $('#pumpInRun').css({
                    top:this.y,
                    left:this.x
                })

                _this.tweenIn1.delay(500).start()
            })
            .onStop(function() {
                 _this.inCoords = { x: 100, y: 192 };
                this.y = _this.inCoords.y;
                this.x = _this.inCoords.x;
                $('#pumpInRun').css({
                    top:this.y,
                    left:this.x
                })
            })
            .onUpdate(function() {
                $('#pumpInRun').css({
                    top:this.y,
                    left:this.x
                })
            })

            _this.tweenIn1.chain(_this.tweenIn2);
            _this.tweenIn2.chain(_this.tweenIn3);
            _this.tweenIn3.chain(_this.tweenIn4);
    }

    initPumpOutAnimate() {
        var _this = this;
        this.tweenOut1 = new TWEEN.Tween(this.outCoords)
            .to({ x: 175, y: -6 }, 500)
            .onStop(function() {
                _this.outCoords =  { x: 175, y: 22 };
                this.y = _this.outCoords.y;
                this.x = _this.outCoords.x;
                $('#pumpOutRun').css({
                    top:192,
                    right:100
                })
            })
            .onUpdate(function() {
                $('#pumpOutRun').css({
                    top:this.y,
                    right:this.x
                })
            })
        this.tweenOut2 = new TWEEN.Tween(this.outCoords)
            .to({ x: 136, y: -6 }, 500)
            .onStop(function() {
                _this.outCoords =  { x: 175, y: 22 };
                this.y = _this.outCoords.y;
                this.x = _this.outCoords.x;
                $('#pumpOutRun').css({
                    top:192,
                    right:100
                })
            })
            .onUpdate(function() {
                $('#pumpOutRun').css({
                    top:this.y,
                    right:this.x
                })
            })

        this.tweenOut3= new TWEEN.Tween(this.outCoords)
            .to({ x: 136, y: 192 }, 2000)
            .onStop(function() {
                _this.outCoords =  { x: 175, y: 22 };
                this.y = _this.outCoords.y;
                this.x = _this.outCoords.x;
                $('#pumpOutRun').css({
                    top:192,
                    right:100
                })
            })
            .onUpdate(function() {
                $('#pumpOutRun').css({
                    top:this.y,
                    right:this.x
                })
            })

        this.tweenOut4 = new TWEEN.Tween(this.outCoords)
            .to({ x: 100, y: 192 }, 500)
            .onStop(function() {
                _this.outCoords =  { x: 175, y: 22 };
                this.y = _this.outCoords.y;
                this.x = _this.outCoords.x;
                $('#pumpOutRun').css({
                    top:192,
                    right:100
                })
            })
            .onComplete(function() {
                _this.outCoords =  { x: 175, y: 22 };
                this.y = _this.outCoords.y;
                this.x = _this.outCoords.x;
                $('#pumpOutRun').css({
                    top:192,
                    right:100
                })

                _this.tweenOut1.delay(500).start()
            })
            .onUpdate(function() {
                $('#pumpOutRun').css({
                    top:this.y,
                    right:this.x
                })
            })

            this.tweenOut1.chain(this.tweenOut2);
            this.tweenOut2.chain(this.tweenOut3);
            this.tweenOut3.chain(this.tweenOut4);    
    }

    initRockerAnimate() {
        var _this = this;
        this.tweenRocker1 = new TWEEN.Tween( $('#rockerTop').get(0).dataset )
                    .to( { rotation: 8 }, 1000 )
                    .onUpdate( function() {
                        _this.updateBox( $('#rockerTop').get(0), this );
                    })
        this.tweenRocker2 = new TWEEN.Tween( $('#rockerTop').get(0).dataset )
                    .to( { rotation: -8 }, 1000 )
                    .onUpdate( function() {
                        _this.updateBox(  $('#rockerTop').get(0), this );
                    })
        
        this.tweenRocker1.chain(this.tweenRocker2)
        this.tweenRocker2.chain(this.tweenRocker1)
    }

    updateBox(box:HTMLElement, params:any) {
        var s = box.style,
            transform = 'rotate(' + Math.floor( params.rotation ) + 'deg)';
        s.webkitTransform = transform;
        // s.mozTransform = transform;
        s.transform = transform;
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