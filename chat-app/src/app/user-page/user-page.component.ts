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
import { PlatformLocation } from '@angular/common'

export class chatbox_pop {
  isadded: boolean;
  username: string;

  constructor() {
    this.isadded = false;
    this.username = undefined;
  }
}
@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})

export class UserPageComponent implements OnInit {

  constructor(private chat: ChatserviceService, private login: LoginComponent,
    private http: Http, private router: Router, private resolver: ComponentFactoryResolver,
    private injector: Injector, private appRef: ApplicationRef, private myapp: AppComponent,
    location: PlatformLocation) {
      /*
       * User has pressed back, so do logout.
       */
      location.onPopState(() => {
          this.logout();
      });
     }

  chat_start_status = false;
  chat_end_status = true;

  chatbox_pop_1 = new chatbox_pop();
  chatbox_pop_2 = new chatbox_pop();
  chatbox_pop_3 = new chatbox_pop();

  chatbox_friends = new Map();
  stranger_list = [];
  istalk_to_stranger = true;

  /*
  * API to to logout from current sessiom. It can be called from anywhere
  * the moment we want to terminate the current user session and redirect
  * to login page.
  */
  logout() {
    this.chat.sendMsg({ 'logout': true });
    this.myapp.reset = true;
    this.myapp.EnterAs = 'NA';
    this.router.navigate(['/logout']);
  }

  userpage_close_chatbox(userId){
    this.delete_chat_box(userId);
  }
  userpage_end_chatbox_stranger(userId, compref){
    this.stranger_list.splice(this.stranger_list.indexOf(userId), 1);
    compref.destroy();
    this.delete_chat_box(userId);
  }

  chatboxpop_userid_assigned(msg) {
    /*
    var oldcomponent = this.chatbox_friends.get(msg['olduserId']);
    this.chatbox_friends.delete(msg['olduserId']);
    this.chatbox_friends.set(msg['newuserId'], oldcomponent);
    */
   var tmp = this.chatbox_friends.get(msg['olduserId']);
   this.chatbox_friends.delete(msg['olduserId']);
   this.chatbox_friends.set(msg['newuserId'], tmp);
   this.stranger_list.push(msg['newuserId']);

   /********************************************************
   * Allow another stranger on assigning previous stranger *
    ********************************************************/
   this.istalk_to_stranger = true;
  }

  addchatbox($event) {
    /*userId will be stranger for the interim time till a stranger is assigned*/
    let userId = 'Stranger';

    if($event != undefined) {
      userId = $event.username;
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
        console.log('Deleting chatbox component for this stranger');
        this.chatbox_friends.delete(userId);
      }
      */
    }

    console.log('open chatbox for '+userId);
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
    /*Logout purpose*/
    this.myapp.reset = true;

    this.chat.sendMsg({ 'send-user-id': this.login.login_handle });
  }

  add_stranger() {
    if (this.istalk_to_stranger == false) {
      alert('Please wait until previous stranger assignment');
      return;
    }

    /***********************************************************
    *Block stranger addition until this stranger gets assigned *
     ***********************************************************/
    this.istalk_to_stranger = false;

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
    console.log('inside create chatbox');
    console.log(friend);
    if (friend != undefined) {
      if (friend.inbox != undefined) {
        friend.inbox.forEach(function (ele) {
          console.log('append msg: '+ele.text+' to user: '+friend.username);
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
      ComponentRef.instance.user_assigned.subscribe(message => this.chatboxpop_userid_assigned(message));

       /************************************************************************
       * Triggered from chatbox component on getting delete-stranger from peer *
       * or end chat pressed from chatbox                                      *
        ************************************************************************/
      ComponentRef.instance.delete_stranger.subscribe(message => this.userpage_end_chatbox_stranger(message, ComponentRef));

      /***************************
      * Tag chatbox for stranger *
       ***************************/
      ComponentRef.instance.setstranger();
    }
  }
}
