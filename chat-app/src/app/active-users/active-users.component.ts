import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { Http, Headers } from '@angular/http';
import { Friend } from '../friend';
import { map } from 'rxjs/operators';

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

  friend_list = [];
  fl = [];
  selected_friend : Friend;
  showSpinner: boolean = true;
  constructor(private http: Http, private login: LoginComponent) { }

  ngOnInit() {
    var header = new Headers();
    header.append('Content-Type', 'application/json');

      let User: Friend = {
        id: "invalid",
        username : this.login.login_handle,
        gender: "invalid",
     };
    this.http.post('http://localhost:3000/api/get-user-fl', User, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
      console.log(res);
      this.fl = res["User"];
      for(var i=0;i<this.fl.length;i++) {
        let friend: Friend = {
          id: this.fl[i]._id.toString(),
          username: this.fl[i].username,
          gender: this.fl[i].gender,
        };
        this.friend_list.push(friend);
        console.log("Send friend : "+friend.username+" for chatbox creation.");
        this.active_user_component_afterinit.emit(friend.username);
      }
      this.showSpinner = false;
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
    console.log("Friend name is :"+ friend.username);
  }
}
