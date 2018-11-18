import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector, ComponentRef,
EmbeddedViewRef, ApplicationRef} from '@angular/core';
import { ChatserviceService } from '../chatservice.service';
import { LoginComponent } from '../login/login.component';
import { ChatboxComponent } from '../chatbox/chatbox.component';
import { Http, Headers } from '@angular/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})

export class UserPageComponent implements OnInit {

  constructor(private chat: ChatserviceService, private login: LoginComponent,
    private http: Http, private router: Router, private resolver: ComponentFactoryResolver,
    private injector: Injector, private appRef: ApplicationRef) { }

  chat_start_status = false;
  chat_end_status = true;
  /*
    active_users: {[key: string]: string} = {};
  */
  active_users = [];

  set_start_chat_status() {
    console.log('start chat pressed');
    this.chat_end_status = false;
    this.chat_start_status = true;
    this.chat.sendMsg({ 'start-chat': true });
  }

  set_end_chat_status() {
    console.log('end chat pressed');
    this.chat_end_status = true;
    this.chat_start_status = false;
    this.chat.sendMsg({ 'end-chat': true });
  }

  logout() {
    this.chat.sendMsg({ 'logout': true });
    this.router.navigate(['/logout']);
  }

  addchatbox($event) {
    var ComponentFactory = this.resolver.resolveComponentFactory(ChatboxComponent);
    var ComponentRef = ComponentFactory.create(this.injector);
    this.appRef.attachView(ComponentRef.hostView);
    const domElement = (ComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    ComponentRef.instance.AddChatboxId($event);
    console.log(domElement);
    console.log(domElement.children);
    console.log(ComponentRef.hostView);
    console.log(ComponentRef);

    const chatboxElement = document.getElementById("chatbox1");
    chatboxElement.appendChild(domElement);
    //const chatbox = chatboxElement.getElementById("chatbox_popup");
    console.log('open chatbox for '+$event);
  }
  ngOnInit() {
    this.chat.messages.subscribe(msg => {
      /*Always check message type. Message type "new-message1" is for admin-use*/
      /*
    if(msg['type'] == "message-admin" && msg['text'] == "send-user-id"){
      console.log("sending user-id back to server:"+this.login.login_handle);
      this.chat.sendMsg({'sent-user-id': this.login.login_handle});
    }
    else*/
      if (msg['type'] == "message-admin" && msg['text'] == "add-user-id") {
        if (this.active_users.indexOf(msg['value']) == -1 &&
          msg['value'] != this.login.login_handle) {
          this.active_users.push(msg['value']);
        }
      }
      else if (msg['type'] == "message-admin" && msg['text'] == "delete-user-id") {
        if (this.active_users.indexOf(msg['value']) != -1) {
          this.active_users.splice(this.active_users.indexOf(msg['value']), 1);
        }
      }
      else if (msg['type'] == "start-chat") {
        if (msg['text'] == false) {

        }
        console.log(msg);
      }
    });

    this.chat.sendMsg({ 'send-user-id': this.login.login_handle });
    this.chat.sendMsg({ 'start-chat': true });
  }
}
