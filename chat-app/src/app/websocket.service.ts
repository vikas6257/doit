import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import * as Rx from 'rxjs';
//import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket;

  connect(): Rx.Subject<MessageEvent> {
    // If you aren't familiar with environment variables then
    // you can hard code `environment.ws_url` as `http://localhost:5000`
    //this.socket = io(environment.ws_url);
    this.socket = io('http://localhost:3000');

    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    let observable = new Observable(observer => {
        this.socket.on('message', (data) => {
          console.log("Received message from Websocket Server")
          observer.next(data);
        })

        return () => {
          this.socket.disconnect();
        }
    });

    // We define our Observer which will listen to messages
    // from our other components and send messages back to our
    // socket server whenever the `next()` method is called.

    /*We need to add all conditions in if statememts, for all admin
    messages from client to server*/
    let observer = {
        next: (data: Object) => {
          console.log(data);
          if (data != undefined) {
           if(data['send-user-id'] != undefined) {
             console.log("Send user id");
             console.log(data);
            this.socket.emit('user_id', data['send-user-id']);
          }
          else if (data['logout'] != undefined) {
              this.socket.disconnect();
          }
          else if (data['start-chat'] != undefined) { //will be used in future
            console.log("start-chat")
            this.socket.emit('start-chat', data['start-chat']);
          }
          else if (data['end-chat'] != undefined) { //will be used in future
            console.log("end-chat")
            this.socket.emit('end-chat', data['end-chat']);
          }
          else if (data['i_am_online'] != undefined) { //will be used in future
            console.log("i_am_online")
            this.socket.emit('i_am_online', data['i_am_online']);
          }
          else {
            console.log("chating msg")
            this.socket.emit('message', data);
          }
        }
        },
    };

    // we return our Rx.Subject which is a combination
    // of both an observer and observable.
    return Rx.Subject.create(observer, observable);
  }
  constructor() { }
}
