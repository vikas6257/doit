import { Component, OnInit } from '@angular/core';
import { ChatserviceService } from '../chatservice.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  constructor(private chat: ChatserviceService) {  }

  ngOnInit() {
    this.chat.messages.subscribe(msg => {
      console.log(msg);
    })
  }

  sendMessage() {
    var in_msg = (<HTMLInputElement>document.getElementById("input_msg")).value;
    console.log('message from input : '+in_msg);
    this.chat.sendMsg(in_msg);
  }

}
