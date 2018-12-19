import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import * as Rx from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket;

  connect(): Rx.Subject<MessageEvent> {
    // If you aren't familiar with environment variables then
    // you can hard code `environment.ws_url` as `http://localhost:5000`
    //this.socket = io(environment.ws_url);
    this.socket = io(environment.http_address);

    this.socket.on('disconnect', () => {
        alert("You are disconnected from the Server. Please login again");
        window.location = window.location.reload(true);
    });

    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    let observable = new Observable(observer => {
        this.socket.on('message', (data) => {
          observer.next(data);
        })

        return () => {
          /**
           * Cleaning-up code on observer unsubscibe can be added here.
           */
        }
    });

    // We define our Observer which will listen to messages
    // from our other components and send messages back to our
    // socket server whenever the `next()` method is called.

    /*We need to add all conditions in if statememts, for all admin
    messages from client to server*/
    let observer = {
        next: (data: Object) => {
          if (data != undefined) {
           if(data['send-user-id'] != undefined) {
            this.socket.emit('user_id', data['send-user-id']);
          }
          else if (data['logout'] != undefined) {
              this.socket.disconnect();
          }
          else if (data['start-chat'] != undefined) {
            this.socket.emit('start-chat', data['start-chat']);
          }
          else if (data['end-chat'] != undefined) {
            this.socket.emit('end-chat', data['end-chat']);
          }
          else if (data['i_am_online'] != undefined) {
            this.socket.emit('i_am_online', data['i_am_online']);
          }
          else if (data['send-friend-request'] != undefined) {
            this.socket.emit('send-friend-request', data['send-friend-request']);
          }
          else if (data['friend-request-accepted'] != undefined) {
            this.socket.emit('friend-request-accepted', data['friend-request-accepted']);
          }
          else if (data['friend-request-rejected'] != undefined) {
            this.socket.emit('friend-request-rejected', data['friend-request-rejected']);
          }
          else {
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
