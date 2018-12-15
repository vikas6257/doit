import {
  Component, OnInit, ViewChild, ViewContainerRef,
  ComponentFactoryResolver, Injector, ComponentRef,
  EmbeddedViewRef, ApplicationRef
} from '@angular/core';
import { ChatserviceService } from '../chatservice.service';
import { LoginComponent } from '../login/login.component';
import { ChatboxComponent } from '../chatbox/chatbox.component';
import { Http, Headers } from '@angular/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { PlatformLocation } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FriendReqComponent } from '../friend-req/friend-req.component';
import { MatSnackBar } from '@angular/material';
import { EventManager } from '@angular/platform-browser';

export class chatbox_pop {
  isadded: boolean;
  username: string;

  constructor() {
    this.isadded = false;
    this.username = undefined;
  }
}

export class fr_req_dialog {
  username: string;
  compref: object;

  constructor() {
    this.username = undefined;
    this.compref = undefined;
  }
}

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})

export class UserPageComponent implements OnInit {

  constructor(
    private chat: ChatserviceService,
    public login: LoginComponent,
    private http: Http,
    private router: Router,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private myapp: AppComponent,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private event_mngr: EventManager
  ) {
      /***********************************************
       * User confirmation on page close or refresh. *
       ***********************************************/
      this.event_mngr.addGlobalEventListener("window", 'beforeunload', function(event) {
        event.returnValue = '';
      });
     }

  chat_start_status = false;
  chat_end_status = true;
  stranger_button_name = 'Talk To Stranger';

  chatbox_pop_1 = new chatbox_pop();
  chatbox_pop_2 = new chatbox_pop();
  chatbox_pop_3 = new chatbox_pop();

  chatbox_friends = new Map();
  stranger_list = new Map();
  istalk_to_stranger = true;

  friend_requests = new Map();

  /*
   * Member variables to add profile pic.
  */
  selectedFile:File;
  dp_url:string = "http://localhost:3000/uploads/" + this.login.login_handle + ".jpg";

  /*
   * API to add profile pic.
  */
  change_profile_pic(event) {
    this.selectedFile = <File>event.target.files[0];
    const fd = new FormData();

    fd.append(this.login.login_handle+".jpg", this.selectedFile);

    this.http.post('http://localhost:3000/add', fd ).pipe(map(res => res.json())).subscribe((res) => {
    });

    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        this.dp_url = event.target.result;
      }
    }
  }

  /*
  * API to logout from current sessiom. It can be called from anywhere
  * the moment we want to terminate the current user session and redirect
  * to login page.
  */
  logout() {
    this.chat.sendMsg({ 'logout': true });
    this.myapp.reset = false;
    setTimeout(()=>{
      this.myapp.reset = true;
      this.router.navigate(['/logout']);
    }, 1000);
  }

  userpage_close_chatbox(userId){
    this.delete_chat_box(userId);
  }
  userpage_end_chatbox_stranger(userId, compref){
    this.friend_requests.delete(userId);
    this.stranger_list.delete(userId);
    compref.destroy();
    this.delete_chat_box(userId);
  }

  chatboxpop_userid_assigned(msg, compref) {
    /*
    var oldcomponent = this.chatbox_friends.get(msg['olduserId']);
    this.chatbox_friends.delete(msg['olduserId']);
    this.chatbox_friends.set(msg['newuserId'], oldcomponent);
    */
   var tmp = this.chatbox_friends.get(msg['olduserId']);
   this.chatbox_friends.delete(msg['olduserId']);
   this.chatbox_friends.set(msg['newuserId'], tmp);
   this.stranger_list.set(msg['newuserId'], compref);

   /********************************************************
   * Allow another stranger on assigning previous stranger *
    ********************************************************/
   this.istalk_to_stranger = true;
   this.snackBar.open("Stranger " +msg['newuserId']+ " assigned to you, Say Hello!", 'Undo', {
     duration: 1500,
     horizontalPosition: 'center',
     verticalPosition: 'top',
   });
   this.stranger_button_name = 'Talk To Stranger'
  }

  addchatbox($event) {
    /*userId will be stranger for the interim time till a stranger is assigned*/
    let userId = 'Stranger';

    if($event != undefined) {
      userId = $event.username;
    }

    var stranger_comp = this.stranger_list.get(userId);
    if (stranger_comp != undefined) {
      stranger_comp.instance.unseen_message = 0;
    }

    var chatboxElement = undefined;
    if (this.chatbox_pop_1.isadded == true) {
      if (this.chatbox_pop_1.username.match(userId) != null) {
        return;
      }
    }
    if (this.chatbox_pop_2.isadded == true) {
      if (this.chatbox_pop_2.username.match(userId) != null) {;
        return;
      }
    }
    if (this.chatbox_pop_3.isadded == true){
      if (this.chatbox_pop_3.username.match(userId) == null) {
        return;
      }
    }
    if (this.chatbox_pop_1.isadded == false){
      chatboxElement = document.getElementById("chatbox1");
      this.chatbox_pop_1.username = userId;
      this.chatbox_pop_1.isadded = true;
    }else if (this.chatbox_pop_2.isadded == false){
      chatboxElement = document.getElementById("chatbox2");
      this.chatbox_pop_2.username = userId;
      this.chatbox_pop_2.isadded = true;
    }else if (this.chatbox_pop_3.isadded == false){
      chatboxElement = document.getElementById("chatbox3");
      this.chatbox_pop_3.username = userId;

      this.chatbox_pop_1.isadded = false;
      this.chatbox_pop_2.isadded = false;
    }
    if (chatboxElement != undefined) {
      if (chatboxElement.hasChildNodes()) {
        chatboxElement.removeChild(chatboxElement.firstChild);
      }
      if (this.chatbox_friends.has(userId) == false) {
        this.create_chatbox($event);
      }
      chatboxElement.appendChild(this.chatbox_friends.get(userId));
      /*
      if (userId == 'Stranger') {
        this.chatbox_friends.delete(userId);
      }
      */
    }
  }

  delete_chat_box(userId) {
    if (this.chatbox_pop_1.isadded == true) {
      if (this.chatbox_pop_1.username.match(userId) != null) {
        this.chatbox_pop_1.isadded = false;
        var chatboxElement = document.getElementById("chatbox1");
        if (chatboxElement.hasChildNodes()) {
          chatboxElement.removeChild(chatboxElement.firstChild);
        }
        return;
      }
    }
    if (this.chatbox_pop_2.isadded == true) {
      if (this.chatbox_pop_2.username.match(userId) != null) {
        this.chatbox_pop_2.isadded = false;
        var chatboxElement = document.getElementById("chatbox2");
        if (chatboxElement.hasChildNodes()) {
          chatboxElement.removeChild(chatboxElement.firstChild);
        }
        return
      }
    }
    if (this.chatbox_pop_3.isadded == true){
      if (this.chatbox_pop_3.username.match(userId) != null) {
        this.chatbox_pop_3.isadded = false;
        var chatboxElement = document.getElementById("chatbox3");
        if (chatboxElement.hasChildNodes()) {
          chatboxElement.removeChild(chatboxElement.firstChild);
        }
        return;
      }
    }
  }

  ngOnInit() {
    this.chat.myConnect();
    this.chat.sendMsg({ 'send-user-id': this.login.login_handle });
  }

  show_friend_requests() {
    const dialogRef = this.dialog.open(FriendReqComponent, {
      data: {friend_req: this.friend_requests}
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }


  /**
   * [userpage_friend_request_recieved Insert friend request to map.
   *                                    key=>name, value=>component ref]
   * @param  user    [user name]
   * @param  compref [component where friend request recieved]
   * @return         [nothing]
   */
  userpage_friend_request_recieved(user, compref) {
    var fr_req = new fr_req_dialog()
    fr_req.username = user;
    fr_req.compref = compref;
    this.friend_requests.set(user, fr_req);
  }

  add_stranger() {
    if (this.istalk_to_stranger == false) {
      this.snackBar.open("Please wait for stranger assignment", 'Undo', {
        duration: 1500,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    /***********************************************************
    *Block stranger addition until this stranger gets assigned *
     ***********************************************************/
    this.istalk_to_stranger = false;
    this.stranger_button_name = 'Searching..'

    this.snackBar.open("Searching for a stranger", 'Undo', {
      duration: 1500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });

    this.create_chatbox(undefined);
  }

  create_chatbox(friend) {
    /*userId will be stranger for the interim time till a stranger is assigned*/
    let userId = 'Stranger';

    if(friend != undefined) {
      userId = friend.username;
    }

    /**************************************************
    *ComponentFactory knows how to create a component *
     **************************************************/
    var ComponentFactory = this.resolver.resolveComponentFactory(ChatboxComponent);
    var ComponentRef = ComponentFactory.create(this.injector);

    /**************************************************************************
    *attachView, so that this component get to know when any variable changes *
     **************************************************************************/
    this.appRef.attachView(ComponentRef.hostView);

    /***************************************************
    *HTML element that can be attached to any HTML DOM *
     ***************************************************/
    const domElement = (ComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    /*******************************************************************************
    *Add friend object to the newly instantiated chatbox component. Friend will be *
    *NULL for strangers.                                                           *
    *                                                                              *
    * Chatbox id:                                                                  *
    * For friends, it will be assigned right now.                                  *
    * For strangers, it will be temporarly assigned 'Stranger'. As soon as         *
    *                 it is assigned a stranger, ids will be changed               *
    *                 dynamically                                                  *
    *******************************************************************************/
    ComponentRef.instance.AddChatboxId(friend);

    /***************************************************
    * Close window pressed from active-users component *
     ***************************************************/
    ComponentRef.instance.close_chatbox.subscribe(message => this.userpage_close_chatbox(message));

    /********************************
    * Adding each chatbox to a list *
     ********************************/
    this.chatbox_friends.set(userId, domElement)
    if (friend != undefined) {
      if (friend.inbox != undefined) {
        friend.inbox.forEach(function (ele) {
          ComponentRef.instance.append_in_msg(ele.text);
        });
      }
    }

    if (userId.match('Stranger') != null) {
      this.chat.sendMsg({'start-chat':'NA'});

      /*************************************************************************
       * Upon assigning id to stranger from chatbox, propogate that change to  *
       * data-structures being maintained here. Like chatbox_friends has key   *
       * 'Stranger' before stranger's id assignment                            *
       *************************************************************************/
      ComponentRef.instance.user_assigned.subscribe(message => this.chatboxpop_userid_assigned(message, ComponentRef));

       /************************************************************************
       * Triggered from chatbox component on getting delete-stranger from peer *
       * or end chat pressed from chatbox                                      *
        ************************************************************************/
      ComponentRef.instance.delete_stranger.subscribe(message => this.userpage_end_chatbox_stranger(message, ComponentRef));

      /***************************************
       *subscribe to friend request recieved *
       ***************************************/
       ComponentRef.instance.friend_request_recieved.subscribe(message => this.userpage_friend_request_recieved(message, ComponentRef));

      /***************************
      * Tag chatbox for stranger *
       ***************************/
      ComponentRef.instance.setstranger();
    }
  }
}
