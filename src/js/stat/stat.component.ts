import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response, URLSearchParams, QueryEncoder } from '@angular/http';
import { ActivatedRoute, Params }   from '@angular/router';
import { StatService } from './stat.service';
var $ = require('jquery');

require('../lib/bootstrap-datetimepicker');
require('../lib/bootstrap-datetimepicker.zh-CN');
require('../../css/bootstrap-datetimepicker.css');

@Component({
    selector: 'stat',
    templateUrl: './stat.component.html',
})
export class StatComponent implements OnInit {
    params:any = {};
    starttime:string;
    endtime:string;
    max:Number = 100;
    min:Number = 0;
    step:Number = 100;
    placeholder:boolean = false;
    id:string;
    type:string = 'temperature';

    constructor( private http:Http, private service:StatService, private route: ActivatedRoute) {
    }
    
    ngOnInit(): void {
        this.route.params.forEach( (param:Params) => {
            _.extend(this.params, param);
        });
        this.init();
        this.search();
    }

    private initChart(xdata:any):void {
        console.log(xdata);
        var cvs = document.getElementById('myChart') as HTMLCanvasElement;
        var ctx = cvs.getContext('2d');
        var params:any = new URLSearchParams(location.search.slice(1));
        var temperaturemode = params.get('temperaturemode');

        var ds = [{
            label: '# ' + this.type,
            pointRadius: 0,
            data: xdata.data,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            yAxisID: '1y'
        }];
        if (params.temperaturemode == '3') {
            if (xdata.data0) {
                ds.push({
                    label: '# temperature2',
                    pointRadius: 0,
                    data: xdata.data0 || [],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: '1y'
                });
            }
            if (xdata.data2) {
                ds.push({
                    label: '# temperature3',
                    pointRadius: 0,
                    data: xdata.data2 || [],
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                    yAxisID: '2y'
                });
            }
        }
        if (this.type == 'gas') {
            if (xdata.data0) {
                ds.push({
                    label: '# flowrate',
                    pointRadius: 0,
                    data: xdata.data0 || [],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: '2y'
                });
            }
        }

        var myChart = new Chart(cvs.getContext('2d'), {
            type: 'line',
            data: {
                labels: xdata.time,
                datasets: ds
            },
            options: {
                hover: {
                    mode: 'label'
                },
                scales: {
                    yAxes: [{
                        id: '1y',
                        type: 'linear',
                        position: 'left'
                    }, {
                        id: '2y',
                        type: 'linear',
                        position: 'right',
                        // ticks: {
                        //     //设置y坐标的后缀
                        //     callback: function(value, index, values) {
                        //         return value;
                        //     }
                        // }
                    }]
                }
            }
        });

    }

    private init():void {
        console.log(this.params)
        this.id = this.params['id'];
        document.title="统计";
        var params = new URLSearchParams(location.search.slice(1));
        if(params) {
            this.type = params.get('type') || 'temperature';
            this.starttime = params.get('starttime');
            this.endtime = params.get('endtime');
            this.max = +params.get('max') || 100;
            this.min = +params.get('min') || 0;
            this.step = +params.get('step') || 100;
            this.placeholder = !!params.get('placeholder');
        }
        

        $('.' + this.type).addClass('select');
        $('#starttime,#endtime').datetimepicker({
            autoclose: true,
            format: 'yyyy-mm-dd hh:ii',
            language: 'zh-CN',
            initialDate: new Date()
        });
    }

    stat(type:string):void{
        this.type = type;
        $('.' + this.type).addClass('select').siblings().removeClass('select');
        this.search();
    }

    showdate(evt:any):void{
        console.log(evt);
        $(evt.srcElement).datetimepicker('show');
    }

    search():void {
        this.type = this.type || 'temperature';
        if(!this.id) return ;
        var searchUrl = `name=${this.id}&type=${this.type}`

         if (this.starttime) {
            searchUrl += '&starttime=' + this.starttime;
        }

        if (this.endtime) {
            searchUrl += '&endtime=' + this.endtime;
        }

        if (this.starttime) {
            searchUrl += '&starttime=' + this.starttime;
        }

        if (this.max) {
            searchUrl += '&max=' + this.max;
        }

        if (this.min) {
            searchUrl += '&min=' + this.min;
        }

        if (this.step) {
            searchUrl += '&step=' + this.step;
        }

        if (this.placeholder) {
            searchUrl += '&placeholder=' + this.placeholder;
        }
    
        this.service.get(searchUrl)
        .then( res => {
            this.initChart(res.json());
        }).catch(err => console.log(err.message || err))
    }
}