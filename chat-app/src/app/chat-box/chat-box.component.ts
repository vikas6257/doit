import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit {
  chat_start_status = false;
  chat_end_status = true;

  set_start_chat_status() {
    this.chat_end_status = false;
    this.chat_start_status = true;
  }

  set_end_chat_status() {
    this.chat_end_status = true;
    this.chat_start_status = false;
  }

  constructor() {
  }

  ngOnInit() {
  }

}
