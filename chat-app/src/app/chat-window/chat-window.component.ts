import { Component, OnInit } from '@angular/core';
import { ChatserviceService } from '../chatservice.service';
import { LoginComponent } from '../login/login.component'

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  constructor(private chat: ChatserviceService, private login: LoginComponent)
   { }

  login_handle = this.login.login_handle;

  msg_rcv:string;
  ngOnInit() {
    this.chat.messages.subscribe(msg => {
      /*Always check message type. Message type "new-message" is used for chatting*/
      console.log(msg);
      if (msg['type'] == "new-message") {
        this.msg_rcv = msg.text;
        var chat_history_id = document.getElementById("chat_history");
        var li_in_chat_history = document.createElement("li");
        li_in_chat_history.appendChild(document.createTextNode(msg.text));
        chat_history_id.appendChild(li_in_chat_history);

        console.log(msg);
    }
    })
  }

  sendMessage() {
    var input_text_ele = document.getElementById("input_msg");
    var in_msg = (<HTMLInputElement>input_text_ele).value;
    console.log('message from input : '+in_msg);
    this.chat.sendMsg(in_msg);
    (<HTMLInputElement>input_text_ele).value = "";
  }

  enter_on_test(event) {
    console.log(event);
    if (event.key == "Enter" && !event.shiftKey) {
      console.log('Enter pressed on text area')
      document.getElementById("sendbutton").click();
    }
    else if (event.key == "Enter" && event.shiftKey) {
      console.log('shift+Enter pressed on text area');
      var value = (<HTMLInputElement>document.getElementById("input_msg")).value;
      (<HTMLInputElement>document.getElementById("input_msg")).value = value+'\n';
    }
  }

  newline(event) {
    console.log(event);
  }
}
