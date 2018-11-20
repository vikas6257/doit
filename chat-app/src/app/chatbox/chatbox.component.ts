import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ChatserviceService } from '../chatservice.service';
import { LoginComponent } from '../login/login.component';
import { OutChatMessage } from '../out_chat_msg';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChatboxComponent implements OnInit {

  constructor(private chat: ChatserviceService, private login: LoginComponent) { }

  isOpened: boolean;
  isMini: boolean;
  isMaxi: boolean;
  userId: undefined;
  msg_rcv:string;
  ngOnInit() {
    this.isOpened = true;
    this.isMaxi = false;
    this.isMini = false;
    this.chat.messages.subscribe(msg => {
      /*Always check message type. Message type "message" is used for chatting*/
      if (msg['type'] == "message") {
        if(msg['from'] == this.userId) {
          this.msg_rcv = msg.text;
          console.log("In chat box componet of ,"this.userId + " and received the message as:" msg);

          var chatlog = document.getElementById("chatlog");

          var main_div = document.createElement("div");
          main_div.setAttribute("class", "chat friend");

          var photo_div = document.createElement("div");
          photo_div.setAttribute("class", "user-photo");
          var image = document.createElement("img");
          image.setAttribute("src","assets/Tyrion Lannister.jpg");
          image.setAttribute("alt","Tyrion lannister");
          photo_div.appendChild(image);

          var msg_div = document.createElement("div");
          msg_div.setAttribute("class", "chat-message");
          msg_div.appendChild(document.createTextNode(msg.text));

          main_div.appendChild(photo_div);
          main_div.appendChild(msg_div);
          chatlog.appendChild(main_div);
          console.log('Inside chatbox: '+msg);
        }
    }
    })
  }

  sendMessage() {
    var input_text_ele = document.getElementById("input_msg");
    var out_msg = (<HTMLInputElement>input_text_ele).value;
    console.log('message from input : '+out_msg);
    /*Should add a check here to send this message only if friend is online*/
    let send_msg: OutChatMessage = {
        to: this.userId,
        msg: out_msg,
    };

    this.chat.sendMsg(send_msg);

    (<HTMLInputElement>input_text_ele).value = "";

    var chatlog = document.getElementById("chatlog");

    var main_div = document.createElement("div");
    main_div.setAttribute("class","chat self");

    var photo_div = document.createElement("div");
    photo_div.setAttribute("class", "user-photo");
    var image = document.createElement("img");
    image.setAttribute("src","assets/Tyrion Lannister.jpg");
    image.setAttribute("alt","Tyrion lannister");
    photo_div.appendChild(image);

    var msg_div = document.createElement("div");
    msg_div.setAttribute("class", "chat-message");
    msg_div.appendChild(document.createTextNode(out_msg));

    main_div.appendChild(photo_div);
    main_div.appendChild(msg_div);
    chatlog.appendChild(main_div);
    console.log(main_div);
  }

  AddChatboxId(id) {
    this.userId = id;
  }
  AddUser() {
    console.log('Pressed + button.');
  }
  MinimizeWindow() {
    this.isMini = true;
    var chatboxdiv = document.getElementById(this.userId);
    chatboxdiv.setAttribute("style","height: 40px; margin-top: 350px;");
    console.log('Pressed Minimize');
  }
  MaximizeWindow() {
    this.isMaxi = true;
    if(this.isMini) {
      var chatboxdiv = document.getElementById(this.userId);
      chatboxdiv.setAttribute("style","height: 400px;");
      this.isMini = false
    }
    console.log('Pressed Maximize');
  }
  CloseWindow() {
    this.isOpened = false;
    console.log('Pressed Close');
  }
}
