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
      if (msg['type'] == "message") {
        this.msg_rcv = msg.text;
        
        var container = document.createElement("div");
        container.setAttribute("style", "display:flex;");

        var chat_history_id = document.getElementById("chat_history");
        var div_from = document.createElement("div");
        div_from.setAttribute("style", "color: green; font-size: medium;");
        div_from.appendChild(document.createTextNode(msg['user_name']+": "));

        var div_msg = document.createElement("div");
        div_msg.appendChild(document.createTextNode(msg.text));
        container.appendChild(div_from);
        container.appendChild(div_msg);
        chat_history_id.appendChild(container);
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

    var container = document.createElement("div");
    container.setAttribute("style", "display:flex;");

    var chat_history_id = document.getElementById("chat_history");
    var div_you = document.createElement("div");
    div_you.setAttribute("style", "color: blue; font-size: medium;");
    div_you.appendChild(document.createTextNode("You: "));

    var div_msg = document.createElement("div");
    div_msg.appendChild(document.createTextNode(in_msg));
    container.appendChild(div_you);
    container.appendChild(div_msg);
    chat_history_id.appendChild(container);
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
