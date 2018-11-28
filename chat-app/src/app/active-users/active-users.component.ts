import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { Http, Headers } from '@angular/http';
import { Friend } from '../friend';
import { Inbox } from '../inbox';
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

  fl = []; /*A local list use to push friends into global friend list*/
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
      /*We got reply from DB about friend-list*/
      /* fl will consist of the list having friends details */
      this.fl = res["User"];

      for(let i=0;i<this.fl.length;i++) {
        /*Create friend object*/
        let friend = new Friend();
          friend.id =  this.fl[i]._id.toString();
          friend.username =  this.fl[i].username;
          friend.gender =  this.fl[i].gender;
          friend.onlinestatus =  this.fl[i].onlinestatus;
          friend.inbox =  new Array();

        /*Push it to the global friend-list defined in login page*/
        this.login.friend_list.push(friend);
      }

      /*Emit a messafe to server saying that I am online. It is used to notify friends
        about my online status*/
      this.chat.sendMsg({ 'i_am_online': this.login.login_handle });

      /*Once friend list is populated, it's time for offline messages*/
      for(let i=0;i<this.login.friend_list.length;i++) {
        /*Create an object for each friend in the friend list to send a get-inbox
        http post request.*/
        let User: Friend = {
            id : this.login.friend_list[i].id,
         };

         /*Note: Different http post request will be send for each friends*/
         this.http.post('http://localhost:3000/api/get-inbox-msg', User, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
            /*res will be a list of inbox messages for a particular friend*/
              for (let j=0;j<res.length;j++) {
                /*Create a inbox object*/
                let inbox: Inbox = {
                  timestamp: res[j].timestamp,
                  text: res[j].text,
                };
                this.login.friend_list[i].inbox.push(inbox);
            }

            /*Once we populate our front-end with inbox message, send a delete to DB*/
            let User: Friend = {
                id : this.login.friend_list[i].id,
             };
             this.http.post('http://localhost:3000/api/delete-inbox-msg', User, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
               console.log(res);
             });

            this.showSpinner = false;
          });
      }
    });
  }

  onSelect(friend: Friend) {
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
