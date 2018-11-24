import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { Http, Headers } from '@angular/http';
import { Friend } from '../friend';
import { map } from 'rxjs/operators';
import { ChatserviceService } from '../chatservice.service';

@Component({
  selector: 'app-active-users',
  templateUrl: './active-users.component.html',
  styleUrls: ['./active-users.component.css']
})

export class ActiveUsersComponent implements OnInit {
  /*
  Create a event.
  */
  @Output() openchatbox = new EventEmitter<string>();
  @Output() active_user_component_afterinit = new EventEmitter<any>();

  fl = [];
  selected_friend : Friend;
  showSpinner: boolean = true;
  constructor(private chat: ChatserviceService,
               private http: Http, private login: LoginComponent) { }

  ngOnInit() {
    var header = new Headers();
    header.append('Content-Type', 'application/json');

    let User: Friend = {
        username : this.login.login_handle,
     };

    this.http.post('http://localhost:3000/api/get-user-fl', User, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
      console.log(res);
      this.fl = res["User"];
      for(var i=0;i<this.fl.length;i++) {
        let friend: Friend = {
          id: this.fl[i]._id.toString(),
          username: this.fl[i].username,
          gender: this.fl[i].gender,
          onlinestatus: this.fl[i].onlinestatus,
        };
        this.login.friend_list.push(friend);
      }
      this.showSpinner = false;
      this.chat.sendMsg({ 'i_am_online': this.login.login_handle });
    });
  }

  onSelect(friend: Friend){
    this.selected_friend = friend;
  }

  EnterChatBox(friend: Friend) {
    /*
    Emmit openchatbox event.
    */
    this.openchatbox.emit(friend.username);
  }
  EnterChatBoxStranger() {
    console.log('open chat box for a stanger');
    this.openchatbox.emit('Stranger');
  }
}
