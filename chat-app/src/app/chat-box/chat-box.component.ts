import { Component, OnInit } from '@angular/core';
import { ChatserviceService } from '../chatservice.service';
import { LoginComponent } from '../login/login.component';
import { Http, Headers } from '@angular/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})

export class ChatBoxComponent implements OnInit {


  constructor(private chat: ChatserviceService, private login: LoginComponent,
              private http: Http,  private router: Router) {
  }

  chat_start_status = false;
  chat_end_status = true;
  /*
    active_users: {[key: string]: string} = {};
  */
    active_users = [];

  set_start_chat_status() {
    this.chat_end_status = false;
    this.chat_start_status = true;
  }

  set_end_chat_status() {
    this.chat_end_status = true;
    this.chat_start_status = false;
  }

  logout() {
     this.chat.sendMsg({'logout': true});
     this.router.navigate(['/logout']);
  }

  ngOnInit() {
    this.chat.messages.subscribe(msg => {
        /*Always check message type. Message type "new-message1" is for admin-use*/
      if(msg['type'] == "new-message1" && msg['text'] == "send-user-id"){
        console.log("sending user-id back to server:"+this.login.login_handle);
        this.chat.sendMsg({'sent-user-id': this.login.login_handle});
      }
      else if(msg['type'] == "new-message1" && msg['text'] == "add-user-id") {
          if (this.active_users.indexOf(msg['value']) == -1 &&
                msg['value'] != this.login.login_handle) {
            this.active_users.push(msg['value']);
          }
      }
      else if(msg['type'] == "new-message1" &&  msg['text'] == "delete-user-id") {
        if (this.active_users.indexOf(msg['value']) != -1) {
          this.active_users.splice(this.active_users.indexOf(msg['value']), 1);
        }
      }
    });

    /*Get request to fetch active-user list once, chat-box component is loaded*/
    this.http.get('http://localhost:3000/api/active-users').pipe(map(res => res.json())).subscribe((res) => {
      console.log(res);
      for(var key in res) {
        this.active_users.push(res[key]);
      }
    });
  }

}
