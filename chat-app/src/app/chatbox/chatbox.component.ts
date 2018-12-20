import {
  Component, OnInit, ViewEncapsulation,
  Output, EventEmitter, OnDestroy, ViewChild,
  ElementRef
} from '@angular/core';
import { ChatserviceService } from '../chatservice.service';
import { LoginComponent } from '../login/login.component';
import { OnlineMessage } from '../online_message';
import { OfflineMessage } from '../offline_message';
import { Friend } from '../friend';
import { Http, Headers } from '@angular/http';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {formatDate } from '@angular/common';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material';
import { MatDialog } from '@angular/material';
import {
  UserConfirmationComponent
} from '../user-confirmation/user-confirmation.component';
import { environment } from '../../environments/environment';

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
  @Output() friend_request_accepted = new EventEmitter<any>();

  /*********************************************************
   *Inform user-page component for friend request recieved *
   *********************************************************/
  @Output() friend_request_recieved = new EventEmitter<string>();

  constructor(
    private chat: ChatserviceService,
    private login: LoginComponent,
    private http: Http,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  //Tags minimized chatbox window
  isMini: boolean;

  //Tags maximized chatbox window
  isMaxi: boolean;

  //Store previous scroll position
  scrollposition: number;

  //User-id of this instance of chatbox window
  userId: string;

  //friend object of this instance
  friend: Friend;

  //Message recieved to this chatbox window
  msg_rcv:string;

  //This window's subscription to websocket
  subscription: Subscription;

  //Tag stranger chatbox window
  isstranger = false;

  unseen_message: number;

  //Used for profile-pic
  dp_url:string;

  my_dp_url:string  = environment.http_address+'/uploads/' +
                      this.login.login_handle + ".jpg";
  /*************************************************
  * Take reference of this component html template *
   *************************************************/
  @ViewChild('chatlog_ref') chatlog_ref: ElementRef;

  append_in_msg(msg) {
    /***********************************************************
    *   Create recieved message that will be added to chatbox. *
     ***********************************************************/
    var chatlog = this.chatlog_ref.nativeElement;

    //Main div
    var main_div = document.createElement("div");
    main_div.setAttribute("class", "chat friend");

    //Photo
    var photo_div = document.createElement("div");
    photo_div.setAttribute("class", "user-photo");

    //Image
    var image = document.createElement("img");
    image.setAttribute("src",this.dp_url);
    image.setAttribute("alt",this.userId);
    image.setAttribute("onerror", "this.src='./assets/Tyrion Lannister.jpg'");

    photo_div.appendChild(image);

    //Message
    var msg_div = document.createElement("div");
    msg_div.setAttribute("class", "chat-message");
    msg_div.appendChild(document.createTextNode(msg));

    main_div.appendChild(photo_div);
    main_div.appendChild(msg_div);
    chatlog.appendChild(main_div);


    /********************************************
     * Scroll down to bottom on sending message.*
     ********************************************/
     chatlog.scrollTop = chatlog.scrollHeight;

    /********************************************
     * Do a pop up count for unseen messages.   *
     ********************************************/
    if (this.isMini == true
      || document.getElementById('chatlog_'+this.userId) == undefined) {
        if (this.isstranger == false) {
          this.friend.unseen_message = this.friend.unseen_message+1;
          this.friend.hasunseen_message = true;
        }
        else {
          this.unseen_message = this.unseen_message+1;
        }
      }
  }
  /**
   * [ngOnInit Subscribes to messages recieved from websocket]
   *            1. Subscription to chat messages, assigned stranger messages
   *                delete stranger messages.
   * @return nothing
   */
  ngOnInit() {
    this.isMaxi = false;
    this.isMini = false;
    this.unseen_message = 0;
    this.scrollposition = 0;
    this.subscription = this.chat.messages.subscribe(msg => {
      /*Always check message type. Message type "message" is used for chatting*/
      if (msg['type'] == "message") {
        if(msg['from'] == this.userId) {
          this.msg_rcv = msg.text;
          this.append_in_msg(msg.text);
        }
    }

    /************************************************************************
    *   As stranger chatbox instantiates, it gets a default temprary id as  *
    *   'Stranger'. Change the temporary id to permanent on user assigned.  *
     ************************************************************************/
    if (msg['type'] == "assigned-stranger") {
      if (this.userId == "Stranger") {
        this.dp_url = environment.http_address+'/uploads/' + msg['userId'] + ".jpg";
        this.user_assigned.emit({'olduserId':this.userId, 'newuserId':msg['userId']});
        this.AddChatboxIdForStanger(msg['userId']);
      }
    }

    /**************************************************************
    *   Remove stranger chatbox on peer stranger chatbox removal. *
     **************************************************************/
    if (msg['type'] == "delete-stranger") {
      this.delete_stranger.emit(msg['userId']);

      this.snackBar.open("Stranger "+msg['userId']+" has decided to disconnect", 'Undo', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }

    /********************************************************************
    * A friend has fired an online message. Change his/her online status*
    *********************************************************************/
    if(msg['type'] == "friend_online") {
      for(let i=0;i<this.login.friend_list.length;i++) {
          if(msg['friend'] == this.login.friend_list[i].username) {
            this.login.friend_list[i].onlinestatus = "true";
          }
      }
    }

    /*********************************************************************
    * A friend has fired an offline message. Change his/her online status*
    **********************************************************************/
    if(msg['type'] == "friend_offline") {
      for(let i=0;i<this.login.friend_list.length;i++) {
          if(msg['friend'] == this.login.friend_list[i].username) {
            this.login.friend_list[i].onlinestatus = "false";
          }
      }
    }

    /*********************************************************************
    * A stranger has fired a friend request.                              *
    **********************************************************************/
    if(msg['type'] == "recieve-friend-request" && this.isstranger == true) {
      /*
       * May want to enable/diable some dom element.
       */

        /*Must always be true.*/
      if(msg['from'] == this.userId) {
          /*
           * Perform some html operation to show a message for friend-request.
           * a. If acceptipng call FriendRequestAccepted()
           * b. If rejecting call FriendRequestRejected()
           */


           this.friend_request_recieved.emit(this.userId);
           this.snackBar.open(msg['from']+" sent you a friend request", 'Undo', {
             duration: 1500,
             horizontalPosition: 'center',
             verticalPosition: 'top',
           });
      }
    }

    /*********************************************************************
    * A stranger has approved your friend request.                         *
    **********************************************************************/
    if(msg['type'] == "friend-request-approved" && this.isstranger == true) {
      /*Must always be true.*/
      if(msg['from'] == this.userId) {
          let new_friend: Friend = {
            id: msg['id'],
            username: this.userId,
            gender: "male", //put dummy for now
            onlinestatus: "true", // starnger must be online
          };
          this.login.friend_list.push(new_friend);

          this.snackBar.open(msg['from']+" accepted your friend request", 'Undo', {
            duration: 1500,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          /*
           * Emit an event on approval to user-page so that newly added user
           * will be gracefully trasnfered from stranger's list to friend-list.
           */
           this.friend_request_accepted.emit(new_friend);
      }
    }

    /*********************************************************************
    * A stranger has declined your friend request.                       *
    **********************************************************************/
    if(msg['type'] == "friend-request-declined" && this.isstranger == true) {
      /*Must always be true.*/
      if(msg['from'] == this.userId) {
        /*
         * May want to enable/diable some dom element.
         */
         this.snackBar.open(msg['from']+" rejected your friend request", 'Undo', {
           duration: 1500,
           horizontalPosition: 'center',
           verticalPosition: 'top',
         });
      }
    }

  })/*End of subscribe*/
  }/* End of ngOnInit*/

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

/*
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

    /*If friend is offline do a DB post for message*/
    if (this.friend != undefined && this.friend.onlinestatus == 'false') {
      let header = new Headers();
      header.append('Content-Type', 'application/json');

      let today= new Date();

      let send_msg: OfflineMessage = {
        to_username: this.friend.username,
        from_username: this.login.login_handle,
        timestamp: formatDate(today, 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530'),
        text: out_msg,
      };

      this.http.post(environment.http_address+'/api/send-inbox-msg', send_msg,
        {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
      });
    }
    else {
      let send_msg: OnlineMessage = {
          to: this.userId,
          msg: out_msg,
      };
      /*****************************
      * Send message to websocket. *
       *****************************/
      this.chat.sendMsg(send_msg);
    }

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
    image.setAttribute("src",this.my_dp_url);
    image.setAttribute("alt",this.login.login_handle);
    image.setAttribute("onerror", "this.src='./assets/Tyrion Lannister.jpg'");
    photo_div.appendChild(image);

    var msg_div = document.createElement("div");
    msg_div.setAttribute("class", "chat-message");
    msg_div.appendChild(document.createTextNode(out_msg));

    main_div.appendChild(photo_div);
    main_div.appendChild(msg_div);
    chatlog.appendChild(main_div);

    /********************************************
    * Scroll down to bottom on sending message. *
     ********************************************/
    chatlog.scrollTop = chatlog.scrollHeight;
  }

  /*
   * Populate friend and userId for which this chatbox belongs to.
   * Note: For strangers Friend will be NULL and userId will be starnger for
   * interim time till a stranger is assigned. Once a stranger is user_assigned
   * AddChatboxIdForStanger() will be called to populate  userId for which this
   * chatbox belongs to.
   */
  AddChatboxId(friend) {
    let userId = 'Stranger';
    this.friend = friend;

    if(friend != undefined) {
      userId = friend.username;
      this.friend.unseen_message = 0;
      this.friend.hasunseen_message = false;
    }

    this.userId = userId;
    this.dp_url = environment.http_address+'/uploads/' + this.userId + ".jpg";
  }

  /*
   * Populate userId for which this chatbox belongs to.
   * Note: For strangers Friend will be NULL.
   */
  AddChatboxIdForStanger(userId) {
    /*Friend object must be NULL for stranger*/
    this.userId = userId;
  }


  setstranger() {
    this.isstranger = true;
  }

  /**
   * API to be called when user wants to send friend-request to a stranger
   */
  AddUser() {
    /*
     * Send a message to server for friend request.
     */
    this.chat.sendMsg({'send-friend-request':{'to':this.userId}});

    this.snackBar.open("A friend request has been sent to "+ this.userId, 'Undo', {
      duration: 1500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });

    /*
     * May want to enable/diable some dom element.
     */

  }

  /**
   * API to be called when user recieves a friend request from a stranger and
   * accepts the friend-request.
   */
  FriendRequestAccepted() {
    /*Just ensure that this is a stranger instance and user-id has been user_assigned
      before adding user to friend-list*/
    if(this.isstranger == true && this.userId != 'Stranger') {
     /*
      * Do a DB post for adding-myself to friend's friend-list.
      */
      let header = new Headers();
      header.append('Content-Type', 'application/json');

      let User = {
          'username' : this.userId,
          'friend_gender': "male", //put dummy for now
          'friend_username' : this.login.login_handle,
      };

      this.http.post(environment.http_address+'/api/add-user-fl', User,
          {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
        /*
         * Send a message to server that friend request has been accepted and
         * provided necessadry details.
         */
        this.chat.sendMsg({'friend-request-accepted':
                    {'to':this.userId, 'id': res['id'].toString()}});

      });

      /*
       * Do a DB post for adding-friend in my friend-list.
       */
       User = {
          'username' : this.login.login_handle,
          'friend_gender': "male", //put dummy for now
          'friend_username' : this.userId,
      };

      this.http.post(environment.http_address+'/api/add-user-fl', User,
          {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
        let new_friend: Friend = {
          id: res['id'].toString(),
          username: this.userId,
          gender: "male", //put dummy for now
          onlinestatus: "true", // starnger must be online
          dp_url : environment.http_address+'/uploads/' + this.userId + ".jpg",
        };
        this.login.friend_list.push(new_friend);
        /*
         * Emit an event on approval to user-page so that newly added user
         * will be gracefully trasnfered from stranger's list to friend-list.
         */
         this.friend_request_accepted.emit(new_friend);
      });


    }
  }

  /**
   * API to be called when user recieves a friend request from a stranger and
   * rejects the friend-request.
   */
  FriendRequestRejected() {
    /*
     * Send a message to server that friend request has been rejected.
     */
    this.chat.sendMsg({'friend-request-rejected':{'to':this.userId}});

    /*
     * May want to enable/diable some dom element.
     */
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
    var header = document.getElementById("header_"+this.userId);

    //Hide chatlog portion of chatbox window
    chatlogdiv.setAttribute("style", "visibility: hidden");

    //Hide input form portion of chatbox window
    inputdiv.setAttribute("style", "visibility: hidden");

    //Reduce height of chatbox window to have an effect of minimize.
    chatboxdiv.setAttribute("style","height: 7%; margin-top:115%; padding:unset");
    header.setAttribute("style","height: 100%");
  }/*End of MinimizeWindow*/

  /**
   * [MaximizeWindow Maximize th chatbox window]
   * @return nothing
   */
  MaximizeWindow() {

    if(this.isMini) {
      this.isMaxi = true;
      if (this.isstranger) {
        this.unseen_message = 0;
      }
      else {
        this.friend.unseen_message = 0;
      }

      //Fetch id of elements going to be changed.
      var chatboxdiv = document.getElementById(this.userId);
      var inputdiv = document.getElementById("input_msg_"+this.userId);
      var chatlogdiv = document.getElementById("chatlog_"+this.userId);
      var header = document.getElementById("header_"+this.userId);

      //Incease height of chatbox window
      chatboxdiv.setAttribute("style","height: 100%");
      header.setAttribute("style","height: 7%");
      chatlogdiv.setAttribute("style", "visibility: visible");
      inputdiv.setAttribute("style", "visibility: visible;");

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

    if (this.isstranger) {
      this.unseen_message = 0;
    }
    else {
      this.friend.unseen_message = 0;
    }
  }

  /**
   * [end_stranger_chat Send end chat to peer,
   *                    close chatbox from user-page component]
   * @return nothing
   */
  end_stranger_chat() {
    const dialogRef = this.dialog.open(UserConfirmationComponent, {
      data: {message: "Disconnect from stranger : "+this.userId}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.chat.sendMsg({'end-chat':{'to':this.userId}});

        /********************************************
        * Emit delete_stranger event, Currently being  *
        * subscribed by user-page component         *
         ********************************************/
        this.delete_stranger.emit(this.userId);

        /*Notify for stranger disconnect.*/
        this.snackBar.open("You have disconnected from stranger: "+this.userId, 'Undo', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    });
  }

  scrollit($event) {
    console.log($event);
    this.scrollposition = event.srcElement.scrollTop;
  }

  /**
   * [set_chatbox_scroll set last scroll position]
   * @return nothing
   */
  set_chatbox_scroll() {
    var chatlog = document.getElementById("chatlog_"+this.userId);
    chatlog.scrollTop = this.scrollposition;
  }
}
