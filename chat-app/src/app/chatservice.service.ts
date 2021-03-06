import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatserviceService {
  messages: Subject<any>;


  constructor(private wsService: WebsocketService) {
   }

  // Calls our wsService connect method
  myConnect() {
    this.messages = <Subject<any>>this.wsService
      .connect()
  }

  // Our simplified interface for sending
  // messages back to our socket.io server
  // Our constructor calls our wsService connect method
  sendMsg(msg) {
    this.messages.next(msg);
  }
}
