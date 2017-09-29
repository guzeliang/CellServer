import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class WsService extends EventEmitter<Object> {
    private websocket: WebSocket;
    constructor() { super(); }

    public init(id: String): WsService {
        let that = this;
        let port = process.env.PORT || location.port;
        this.websocket = new WebSocket(`ws://${location.hostname}:${port}`);

        this.websocket.onopen = function(evt) {
            console.log('open');
            let data = {
                clientId: id
            };
            this.send(JSON.stringify({
              action: 'browser_first_conn', data: {
              clientId: id
            }}));
        };
        this.websocket.onclose = function(evt) {
            console.log('onclose');
        };
        this.websocket.onmessage = function(evt) {
            try {
              let data = JSON.parse(evt.data);
              if (data.action) {
                  that.emit(data);
              }
            } catch (e) {
              console.log(e.message); 
            }
        };
        this.websocket.onerror = function(evt) {
            console.log('onerror');
        };

        return this;
    }
}
