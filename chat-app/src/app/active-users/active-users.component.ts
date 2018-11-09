import { Component, OnInit } from '@angular/core';
import { ChatBoxComponent } from '../chat-box/chat-box.component';

@Component({
  selector: 'app-active-users',
  templateUrl: './active-users.component.html',
  styleUrls: ['./active-users.component.css']
})

export class ActiveUsersComponent implements OnInit {

  active_users = {};

  constructor(private chat_box:  ChatBoxComponent) { }

  ngOnInit() {
    this.active_users = this.chat_box.active_users;
  }

}
