import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector, ComponentRef,
EmbeddedViewRef, ApplicationRef} from '@angular/core';
import { ChatserviceService } from '../chatservice.service';
import { LoginComponent } from '../login/login.component';
import { ChatboxComponent } from '../chatbox/chatbox.component';
import { Http, Headers } from '@angular/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    private injector: Injector, private appRef: ApplicationRef,
    ) { }

  chat_start_status = false;
  chat_end_status = true;

  chatbox_pop_1 = new chatbox_pop();
  chatbox_pop_2 = new chatbox_pop();
  chatbox_pop_3 = new chatbox_pop();

  chatbox_friends = new Map();

  logout() {
    this.chat.sendMsg({ 'logout': true });
    this.router.navigate(['/logout']);
  }
  userpage_close_chatbox(userId){
    console.log('closing from UserPageComponent for : '+userId);
    console.log(this.chatbox_friends.get(userId));
    this.delete_chat_box(userId);
    console.log(this.chatbox_friends.get(userId));
  }
  userpage_close_chatbox_stranger(userId, compref){
    console.log('closing from UserPageComponent for stranger : '+userId);
    console.log(this.chatbox_friends.get(userId));
    compref.destroy();
    this.delete_chat_box(userId);
    console.log(this.chatbox_friends.get(userId));
  }

  chatboxpop_userid_assigned(msg) {
    console.log('Changing component instance key from : ' + msg['olduserId'] + ', to : '+ msg['newuserId']);
    /*
    var oldcomponent = this.chatbox_friends.get(msg['olduserId']);
    this.chatbox_friends.delete(msg['olduserId']);
    this.chatbox_friends.set(msg['newuserId'], oldcomponent);
    */
    if (this.chatbox_pop_1.username.match(msg['olduserId']) != null) {
      this.chatbox_pop_1.username = msg['newuserId'];
      console.log('username of chatbox_pop_1 changed from :'+msg['olduserId']+', to :'+msg['newuserId']);
    }else if (this.chatbox_pop_2.username.match(msg['olduserId']) != null) {
      this.chatbox_pop_2.username = msg['newuserId'];
      console.log('username of chatbox_pop_2 changed from :'+msg['olduserId']+', to :'+msg['newuserId']);
    }else if (this.chatbox_pop_3.username.match(msg['olduserId']) != null) {
      this.chatbox_pop_3.username = msg['newuserId'];
      console.log('username of chatbox_pop_3 changed from :'+msg['olduserId']+', to :'+msg['newuserId']);
    }
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
        this.create_chatbox_for_friends($event);
      }
      chatboxElement.appendChild(this.chatbox_friends.get(userId));
      if (userId == 'Stranger') {
        console.log('Deleting chatbox component for this stranger');
        this.chatbox_friends.delete(userId);
      }
    }

    console.log('open chatbox for '+userId);
  }

  delete_chat_box(userId) {
    console.log('Deleting chatbox for : '+userId);

    if (this.chatbox_pop_1.isadded == true) {
      if (this.chatbox_pop_1.username.match(userId) != null) {
        this.chatbox_pop_1.isadded = false;
        console.log('Deleting chatbox from div chatbox1');
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
        console.log('Deleting chatbox from div chatbox2');
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
        console.log('Deleting chatbox from div chatbox3');
        var chatboxElement = document.getElementById("chatbox3");
        if (chatboxElement.hasChildNodes()) {
          chatboxElement.removeChild(chatboxElement.firstChild);
        }
        return;
      }
    }
  }

  ngOnInit() {
    this.chat.sendMsg({ 'send-user-id': this.login.login_handle });
  }

  create_chatbox_for_friends(friend) {
    /*userId will be stranger for the interim time till a stranger is assigned*/
    let userId = 'Stranger';

    if(friend != undefined) {
      userId = friend.username;
    }

    console.log('Creating chatbox for: '+userId);
    var ComponentFactory = this.resolver.resolveComponentFactory(ChatboxComponent);
    var ComponentRef = ComponentFactory.create(this.injector);
    this.appRef.attachView(ComponentRef.hostView);
    const domElement = (ComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    /*Add friend object to the newly instantiated chatbox component. Friend will be
      NULL for strangers.*/
    ComponentRef.instance.AddChatboxId(friend);
    ComponentRef.instance.close_chatbox.subscribe(message => this.userpage_close_chatbox(message));
    this.chatbox_friends.set(userId, domElement);
    if (userId.match('Stranger') != null) {
      this.chat.sendMsg({'start-chat':'NA'});
      ComponentRef.instance.user_assigned.subscribe(message => this.chatboxpop_userid_assigned(message));
      ComponentRef.instance.delete_stranger.subscribe(message => this.userpage_close_chatbox_stranger(message, ComponentRef));
      ComponentRef.instance.close_chatbox.subscribe(message => this.userpage_close_chatbox_stranger(message, ComponentRef));
      ComponentRef.instance.setstranger();
    }
    else {
      ComponentRef.instance.close_chatbox.subscribe(message => this.userpage_close_chatbox(message));
    }
  }
}
