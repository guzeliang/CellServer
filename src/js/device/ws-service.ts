import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class WsService extends EventEmitter<Object> {
    private websocket:WebSocket;
    constructor() { super(); }

    init(id:String) :WsService {
        var that = this;
        var port = process.env.PORT || 8103;
        this.websocket = new WebSocket(`ws://${location.hostname}:${port}`);

        this.websocket.onopen = function(evt) {
            console.log('open');
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
                if(data.action) {
                    that.emit(data);
                }
            } catch(e) {
                
            }
        };
        this.websocket.onerror = function(evt) {
            console.log('onerror');
        };

        return this;
    }

}