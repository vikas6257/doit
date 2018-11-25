import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, OnDestroy} from '@angular/core';
import { ChatserviceService } from '../chatservice.service';
import { LoginComponent } from '../login/login.component';
import { OutChatMessage } from '../out_chat_msg';
import { Friend } from '../friend';
import { Http, Headers } from '@angular/http';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChatboxComponent implements OnInit, OnDestroy{

  @Output() close_chatbox = new EventEmitter<string>();
  @Output() user_assigned = new EventEmitter<any>();
  @Output() delete_stranger = new EventEmitter<string>();

  constructor(private chat: ChatserviceService, private login: LoginComponent,
               private http: Http,) { }

  //Tags minimized chatbox window
  isMini: boolean;

  //Tags maximized chatbox window
  isMaxi: boolean;

  //User-id of this instance of chatbox window
  userId: undefined;

  //Message recieved to this chatbox window
  msg_rcv:string;

  //This window's subscription to websocket
  subscription: Subscription;

  //Tags stranger chatbox window
  isstranger = false;
  /**
   * [ngOnInit Subscribes to messages recieved from websocket]
   *            1. Subscription to chat messages, assigned stranger messages
   *                delete stranger messages.
   * @return nothing
   */
  ngOnInit() {
    this.isMaxi = false;
    this.isMini = false;
    this.subscription = this.chat.messages.subscribe(msg => {
      /*Always check message type. Message type "message" is used for chatting*/
      if (msg['type'] == "message") {
        if(msg['from'] == this.userId) {
          this.msg_rcv = msg.text;

          /***********************************************************
          *   Create recieved message that will be added to chatbox. *
           ***********************************************************/
          var chatlog = document.getElementById("chatlog_"+this.userId);

          //Main div
          var main_div = document.createElement("div");
          main_div.setAttribute("class", "chat friend");

          //Photo
          var photo_div = document.createElement("div");
          photo_div.setAttribute("class", "user-photo");

          //Image
          var image = document.createElement("img");
          image.setAttribute("src","assets/Tyrion Lannister.jpg");
          image.setAttribute("alt","Tyrion lannister");
          photo_div.appendChild(image);

          //Message
          var msg_div = document.createElement("div");
          msg_div.setAttribute("class", "chat-message");
          msg_div.appendChild(document.createTextNode(msg.text));

          main_div.appendChild(photo_div);
          main_div.appendChild(msg_div);
          chatlog.appendChild(main_div);
        }
    }/*End of subscription callback*/

    /************************************************************************
    *   As stranger chatbox instantiates, it gets a default temprary id as  *
    *   'Stranger'. Change the temporary id to permanent on user assigned.  *
     ************************************************************************/
    if (msg['type'] == "assigned-stranger") {
      if (this.userId == "Stranger") {
        this.user_assigned.emit({'olduserId':this.userId, 'newuserId':msg['userId']});
        this.AddChatboxId(msg['userId']);
      }
    }

    /**************************************************************
    *   Remove stranger chatbox on peer stranger chatbox removal. *
     **************************************************************/
    if (msg['type'] == "delete-stranger") {
      this.delete_stranger.emit(msg['userId']);
    }})/*End of subscribe*/
  }/* End of ngOnInit*/

  ngOnDestroy() {
  }

/**
 * [sendMessage Sends the message typed input form to websocket.]
 *              1. Removes typed text in input form.
 *              2. Sends typed message to websocket.
 *
 * @return [nothing]
 */
  sendMessage() {
    var input_text_ele = document.getElementById("input_msg_"+this.userId);
    var out_msg = (<HTMLInputElement>input_text_ele).value;
    /*Remove message from input field*/
    (<HTMLInputElement>input_text_ele).value = "";

    /*Should add a check here to send this message only if friend is online*/
    let send_msg: OutChatMessage = {
        to: this.userId,
        msg: out_msg,
    };

    /*****************************
    * Send message to websocket. *
     *****************************/
    this.chat.sendMsg(send_msg);

    var chatlog = document.getElementById("chatlog_"+this.userId);

    /***************************************************************
    *               Self message format                            *
    *    Main div                                                  *
    *    +--------------------------------------------------+      *
    *    |+-------------------------------------+  +-------+|      *
    *    || Chat message div                    |  |img div||      *
    *    |+-------------------------------------+  +-------+|      *
    *    +--------------------------------------------------+      *
    ***************************************************************/

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
  }

  AddChatboxId(id) {
    this.userId = id;
  }
  setstranger() {
    this.isstranger = true;
  }
  AddUser() {
    if(this.userId != 'Stranger') {
      var header = new Headers();
      header.append('Content-Type', 'application/json');

      let User = {
          'username' : this.login.login_handle,
          'friend_gender': "male",
          'friend_username' : this.userId,
      };

      this.http.post('http://localhost:3000/api/add-user-fl', User, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
        console.log(res);
        let friend: Friend = {
          id: res['id'].toString(),
          username: this.userId,
          gender: "male", //put dummy for now
          onlinestatus: "true", // starnger must be online
        };

        this.login.friend_list.push(friend);

      });
    }
  }

  /**
   * [MinimizeWindow Minimize the chatbox window]
   * @return nothing
   */
  MinimizeWindow() {
    this.isMini = true;

    //Fetch id of elements going to be changed.
    var chatboxdiv = document.getElementById(this.userId);
    var inputdiv = document.getElementById("input_msg_"+this.userId);
    var chatlogdiv = document.getElementById("chatlog_"+this.userId);

    //Hide chatlog portion of chatbox window
    chatlogdiv.setAttribute("style", "display: none");

    //Hide input form portion of chatbox window
    inputdiv.setAttribute("style", "display: none");

    //Reduce height of chatbox window to have an effect of minimize.
    chatboxdiv.setAttribute("style","height: 40px; margin-top: 350px;");
  }/*End of MinimizeWindow*/

  /**
   * [MaximizeWindow Maximize th chatbox window]
   * @return nothing
   */
  MaximizeWindow() {

    if(this.isMini) {
      this.isMaxi = true;

      //Fetch id of elements going to be changed.
      var chatboxdiv = document.getElementById(this.userId);
      var inputdiv = document.getElementById("input_msg_"+this.userId);
      var chatlogdiv = document.getElementById("chatlog_"+this.userId);

      //Incease height of chatbox window
      chatboxdiv.setAttribute("style","height: 400px;");

      //Change attributes to default
      chatlogdiv.setAttribute("style","display: block");
      inputdiv.setAttribute("style", "display: flex");
      this.isMini = false
    }
  }/*End of MaximizeWindow*/

  /**
   * [CloseWindow Close chatbox window]
   * @return nothing
   */
  CloseWindow() {
    /****************************************************
    * Emit close_chatbox event.                         *
    * Currently user-page has subscribed to this event. *
     ****************************************************/
    this.close_chatbox.emit(this.userId);

    //Send end chat message having destination, to peer.
    if (this.isstranger == true) {
      this.chat.sendMsg({'end-chat':{'to':this.userId}});
    }
  }
}
