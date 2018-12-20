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
import { environment } from '../../environments/environment';

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

  /*
  * Map to hold dom elements for all chat boxes.
  * key: userId
  * value: DOM element
  */
  chatbox_instances = new Map();

  /*
  * Map to hold component refrences  for all stranger's chat boxes.
  * key: userId
  * value: comp reference
  */
  stranger_list = new Map();

  istalk_to_stranger = true;

  /*
  * Map to hold incoming friend requests for starngers.
  * key: userId
  * value: fr_req_dialog
  */
  friend_requests = new Map();

  /*
   * Member variables to add profile pic.
  */
  selectedFile:File;
  dp_url:string = environment.http_address+'/uploads/' + this.login.login_handle + ".jpg";

  /*
   * API to add profile pic.
  */
  change_profile_pic(event) {
    this.selectedFile = <File>event.target.files[0];
    const fd = new FormData();

    fd.append(this.login.login_handle+".jpg", this.selectedFile);

    this.http.post(environment.http_address+'/add', fd )
      .pipe(map(res => res.json())).subscribe((res) => {
        console.log(res);
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
      this.router.navigate(['/logout'], {skipLocationChange: true});
    }, 1000);
  }

  /*
  * API to be called once user click on close button inside chatbox(emitted
  * from chatbox component). It just clears the chatbox component specific DOM
  * from chatbox pop-up element.
  */
  userpage_close_chatbox(userId){
    this.delete_chat_box(userId);
  }

  /*
  * API to be called once user clicks on "Talk to stranger"
  */
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

  /*
  * API to be called once a stranger is disconnected(either locally or remotely).
  * It performs entry deletion from chatbox_instances list, stranger_list and
  * chatbox_instances and then finally destroys the component.
  */
  userpage_end_chatbox_stranger(userId, compref){
    this.friend_requests.delete(userId);
    this.stranger_list.delete(userId);
    this.chatbox_instances.delete(userId);
    compref.destroy();
    this.delete_chat_box(userId);
  }

  /*
  * API to be called once a stranger is assigned. It performs entry deletion
  * from chatbox_instances list and again populate it with new key as stranger's
  * user-id. Then it populates the stranger_list with key as stranger's id and
  * value as comp reference.
  */
  chatboxpop_userid_assigned(msg, compref) {
   var tmp = this.chatbox_instances.get(msg['olduserId']);
   this.chatbox_instances.delete(msg['olduserId']);
   this.chatbox_instances.set(msg['newuserId'], tmp);
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

  /*
  * API to gracefully move stranger form stranger's list to friend-list.
  */
  userpage_friend_request_accepted(friend , compref) {
    compref.instance.friend = friend;
    compref.instance.isstranger = false;
    if(compref.instance.unseen_message > 0) {
      compref.instance.friend.unseen_message = compref.instance.unseen_message;
      compref.instance.friend.hasunseen_message = true;
    }
    else {
      compref.instance.friend.unseen_message = 0;
      compref.instance.friend.hasunseen_message = false;
    }
    this.stranger_list.delete(friend.username);
  }

  /*
  * API to be called if user clicks on any of the members in active-user component.
  */
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
    if (this.chatbox_pop_1.username == userId) {
        return;
      }

    if (this.chatbox_pop_2.username == userId) {
        return;
      }

    if (this.chatbox_pop_3.username == userId) {
        return;
      }

    /*If all are filled, mark all unfilled*/
    if (this.chatbox_pop_1.isadded == true
      && this.chatbox_pop_2.isadded == true
      && this.chatbox_pop_3.isadded == true
    )
    {
      this.chatbox_pop_1.isadded = false;
      this.chatbox_pop_2.isadded = false;
      this.chatbox_pop_3.isadded = false;
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
      this.chatbox_pop_3.isadded = true;
    }
    if (chatboxElement != undefined) {
      if (chatboxElement.hasChildNodes()) {
        chatboxElement.removeChild(chatboxElement.firstChild);
      }
      if (this.chatbox_instances.has(userId) == false) {
        this.create_chatbox($event);
      }
      chatboxElement.appendChild(
        this.get_domelement_from_component(
          this.chatbox_instances.get(userId)
        )
      );

      /*Set last scroll position*/
      this.chatbox_instances.get(userId).instance.set_chatbox_scroll();
    }
  }

  /*
  * API clears the chatbox component specific dom from chatbox pop-up element.
  * API to be called :-
  *    a. if user closes chat box to remove its dom elements from chatbox popup.
  *    b. if user has ended the chat for any stranger.
  */
  delete_chat_box(userId) {
    var chatbox = document.getElementById(userId);

    /**********************************
     * GRAND PARENT   => chatbox1,2,3 *
     * PARENT         => app-chatbox  *
     * CHILS          => chatbox      *
     **********************************/
    if (chatbox.parentElement.parentElement.id == 'chatbox1') {
      this.chatbox_pop_1.username = undefined;
      this.chatbox_pop_1.isadded = false;
    }
    else if (chatbox.parentElement.parentElement.id == 'chatbox2') {
      this.chatbox_pop_2.username = undefined;
      this.chatbox_pop_2.isadded = false;
    }
    else if (chatbox.parentElement.parentElement.id == 'chatbox3') {
      this.chatbox_pop_3.username = undefined;
      this.chatbox_pop_3.isadded = false;
    }
    /*Remove app-chatbox from chatbox1,2,3*/
    chatbox.parentElement.parentElement.removeChild(chatbox.parentElement);
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

  get_domelement_from_component(ComponentRef) {
    /***************************************************
     *HTML element that can be attached to any HTML DOM *
     ****************************************************/
     const domElement = (ComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
     return domElement;
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
    ComponentRef.instance.close_chatbox.subscribe(message =>
      this.userpage_close_chatbox(message));

    /********************************
    * Adding each chatbox to a list *
     ********************************/
    this.chatbox_instances.set(userId, ComponentRef);

    /***********************************************************************
    * Append all th inbox messages in chatlog and delete the inbox messages*
    * from friend object.                                                  *
    ***********************************************************************/
    if (friend != undefined) {
      if (friend.inbox != undefined) {
        friend.inbox.forEach(function (ele) {
          ComponentRef.instance.append_in_msg(ele.text);
        });
        friend.inbox.length = 0;
      }
    }

    if (userId == 'Stranger') {
      this.chat.sendMsg({'start-chat':'NA'});

      /*************************************************************************
       * Upon assigning id to stranger from chatbox, propogate that change to  *
       * data-structures being maintained here. Like chatbox_instances has key   *
       * 'Stranger' before stranger's id assignment                            *
       *************************************************************************/
      ComponentRef.instance.user_assigned.subscribe(message =>
        this.chatboxpop_userid_assigned(message, ComponentRef));

       /************************************************************************
       * Triggered from chatbox component on getting delete-stranger from peer *
       * or end chat pressed from chatbox                                      *
        ************************************************************************/
      ComponentRef.instance.delete_stranger.subscribe(message =>
        this.userpage_end_chatbox_stranger(message, ComponentRef));

      /***************************************
       *subscribe to friend request recieved *
       ***************************************/
       ComponentRef.instance.friend_request_recieved.subscribe(message =>
         this.userpage_friend_request_recieved(message, ComponentRef));

      /***************************************
       *subscribe to friend request recieved *
       ***************************************/
       ComponentRef.instance.friend_request_accepted.subscribe(message =>
         this.userpage_friend_request_accepted(message, ComponentRef));

      /***************************
      * Tag chatbox for stranger *
       ***************************/
      ComponentRef.instance.setstranger();
    }
  }
}
