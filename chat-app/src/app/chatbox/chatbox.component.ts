import { Component, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
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

  @Output() close_chatbox = new EventEmitter<string>();
  @Output() user_assigned = new EventEmitter<any>();
  @Output() delete_stranger = new EventEmitter<string>();

  constructor(private chat: ChatserviceService, private login: LoginComponent) { }

  isMini: boolean;
  isMaxi: boolean;
  userId: undefined;
  msg_rcv:string;
  ngOnInit() {
    this.isMaxi = false;
    this.isMini = false;
    this.chat.messages.subscribe(msg => {
      /*Always check message type. Message type "message" is used for chatting*/
      if (msg['type'] == "message") {
        if(msg['from'] == this.userId) {
              console.log('from : '+msg['from']+' this : '+this.userId);
          this.msg_rcv = msg.text;

          var chatlog = document.getElementById("chatlog_"+this.userId);

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
    if (msg['type'] == "assigned-stranger") {
      console.log('User assigned message recieved in chatbox');
      if (this.userId == "Stranger") {
        this.user_assigned.emit({'olduserId':this.userId, 'newuserId':msg['userId']});
        this.AddChatboxId(msg['userId']);
      }
    }
    if (msg['type'] == "delete-stranger") {
      console.log('Stranger : '+msg['userId']+' has disconnet the chat.')
      console.log('Remove chatbox popup.');
      this.delete_stranger.emit(msg['userId']);
    }
    })
  }

  sendMessage() {
    var input_text_ele = document.getElementById("input_msg_"+this.userId);
    var out_msg = (<HTMLInputElement>input_text_ele).value;
    console.log('message from input : '+out_msg);
    /*Should add a check here to send this message only if friend is online*/
    let send_msg: OutChatMessage = {
        to: this.userId,
        msg: out_msg,
    };

    this.chat.sendMsg(send_msg);

    (<HTMLInputElement>input_text_ele).value = "";

    var chatlog = document.getElementById("chatlog_"+this.userId);

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
    var inputdiv = document.getElementById("input_msg_"+this.userId);
    var chatlogdiv = document.getElementById("chatlog_"+this.userId);
    chatlogdiv.setAttribute("style", "display: none");
    inputdiv.setAttribute("style", "display: none");
    chatboxdiv.setAttribute("style","height: 40px; margin-top: 350px;");
    console.log('Pressed Minimize');
  }
  MaximizeWindow() {
    if(this.isMini) {
      this.isMaxi = true;
      var chatboxdiv = document.getElementById(this.userId);
      chatboxdiv.setAttribute("style","height: 400px;");
      var inputdiv = document.getElementById("input_msg_"+this.userId);
      var chatlogdiv = document.getElementById("chatlog_"+this.userId);
      chatlogdiv.setAttribute("style","display: block");
      inputdiv.setAttribute("style", "display: flex");
      this.isMini = false
    }
    console.log('Pressed Maximize');
  }
  CloseWindow() {
    console.log('Pressed Close');
    this.close_chatbox.emit(this.userId);
    this.chat.sendMsg({'end-chat':{'to':this.userId}});
  }
}
