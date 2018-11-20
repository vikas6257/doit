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
    private injector: Injector, private appRef: ApplicationRef,
    ) { }

  chat_start_status = false;
  chat_end_status = true;
  chatbox_pop_1 = false;
  chatbox_pop_2 = false;
  chatbox_pop_3 = false;

  chatbox_friends = new Map();

  logout() {
    this.chat.sendMsg({ 'logout': true });
    this.router.navigate(['/logout']);
  }

  addchatbox($event) {
    var chatboxElement;
    if (this.chatbox_pop_1 == false) {
      chatboxElement = document.getElementById("chatbox1");
      this.chatbox_pop_1 = true;
    }else if (this.chatbox_pop_2 == false) {
      chatboxElement = document.getElementById("chatbox2");
      this.chatbox_pop_2 = true;
    }else if (this.chatbox_pop_3 == false){
      chatboxElement = document.getElementById("chatbox3");
      this.chatbox_pop_3 = true;
    }
    chatboxElement.appendChild(this.chatbox_friends.get($event));
    //const chatbox = chatboxElement.getElementById("chatbox_popup");
    console.log('open chatbox for '+$event);
  }
  ngOnInit() {
    this.chat.sendMsg({ 'send-user-id': this.login.login_handle });
  }
  create_chatbox_for_friends(friend) {
    console.log('Creating chatbox for: '+friend);
    var ComponentFactory = this.resolver.resolveComponentFactory(ChatboxComponent);
    var ComponentRef = ComponentFactory.create(this.injector);
    this.appRef.attachView(ComponentRef.hostView);
    const domElement = (ComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    ComponentRef.instance.AddChatboxId(friend);
    this.chatbox_friends.set(friend, domElement);
  }
}
