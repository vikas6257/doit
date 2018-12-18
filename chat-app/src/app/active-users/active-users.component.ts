import {
  Component, OnInit, Output, EventEmitter, Input
} from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { Http, Headers } from '@angular/http';
import { Friend } from '../friend';
import { OfflineMessage } from '../offline_message';
import { map } from 'rxjs/operators';
import { ChatserviceService } from '../chatservice.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-active-users',
  templateUrl: './active-users.component.html',
  styleUrls: ['./active-users.component.css']
})

export class ActiveUsersComponent implements OnInit {
  /*
  Create a event.
  */
  @Output() openchatbox = new EventEmitter<any>();
  @Output() snd_active_usr_to_user_page_comp = new EventEmitter<any>();

  // OPTIMIZE: Don't traverse list of friends and strangers just to get stranger
  @Input() stranger_list

  fl = []; /*A local list use to push friends into global friend list*/
  selected_friend : Friend;
  showSpinner: boolean = true;
  constructor(private chat: ChatserviceService,
               private http: Http, private login: LoginComponent) { }

  ngOnInit() {
    this.getFriendList();
    /*For transient cases, let's keep sending this keepalive message to backend*/
    setInterval(() => {
         this.chat.sendMsg({ 'i_am_online': this.login.login_handle });
    }, 10000);
  }

  /*
   * Do a DB get for fetching friend-list for the user. It internally call
   * other routines to get/delete inbox messages from DB.
   */
  getFriendList() {
    var header = new Headers();
    header.append('Content-Type', 'application/json');

    let User: Friend = {
        username : this.login.login_handle,
     };

    this.http.post(environment.http_address+'/api/get-user-fl', User,
        {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
       /*
        * Emit a message to server saying that I am online. It is used to notify
        * friends about my online status. This message msut be placed here when
        * we get response for friend_list to ensure that server must have populated
        * my friend list in local cache.
        */
       this.chat.sendMsg({ 'i_am_online': this.login.login_handle });

      /*
       * We got reply from DB about friend-list. Populate fl with the reply
       * and start iterating over fl to create each friend object and push it
       * global friend list.
       */
      this.fl = res["User"];

      /*Switch off the spinner.*/
      if(this.fl.length == 0){
        this.showSpinner = false;
      }

      for(let i=0;i<this.fl.length;i++) {
        /*Create friend object*/
        let friend = new Friend();
          friend.id =  this.fl[i]._id.toString();
          friend.username =  this.fl[i].username;
          friend.gender =  this.fl[i].gender;
          friend.onlinestatus =  this.fl[i].onlinestatus;
          friend.inbox =  new Array();
          friend.unseen_message = 0;
          friend.hasunseen_message = false;
          friend.dp_url = environment.http_address+'/uploads/' +
                             friend.username + ".jpg";

         /*
          * Push it to the global friend-list defined in login page.
          */
          this.login.friend_list.push(friend);
          if (i == this.fl.length-1) {
            this.getInboxMessages(friend, true);
          }
          else {
            this.getInboxMessages(friend, false);
          }
      }
    });
  }

  /*
   * Do a DB get for fetching inbox messages for a particular friend. It
   * internally calls routine to delete inbox messages from DB once local
   * cache(friend.inbox) is populated.
   */
  getInboxMessages(friend, spinner) {
    var header = new Headers();
    header.append('Content-Type', 'application/json');

    /*
    * Create an object for each friend in the friend list to send a get-inbox
    * http post request.
    */
    let User: Friend = {
        id : friend.id,
     };

     /*
      * Note: Different http post request will be send for each friends.
      */
     this.http.post(environment.http_address+'/api/get-inbox-msg',
         User, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
        /*
         * res will be a list of inbox messages for a particular friend.
         */
        for (let j=0;j<res.length;j++) {
          /*Create a inbox object*/
          let inbox: OfflineMessage = {
            timestamp: res[j].timestamp,
            text: res[j].text,
          };
          friend.inbox.push(inbox);
        }

        this.deleteInboxMessages(friend);

        /***************************************************************
        * Send each friend to user-page component, to instantiate      *
        * chatbox for all friends. It's must be done here to get inbox *
        * messages as well as to get chat subscribtion for other msg.  *
        ***************************************************************/
        this.snd_active_usr_to_user_page_comp.emit(friend);
        if(spinner) {
          this.showSpinner = false;
        }
      });
  }

  /*
   * Do a DB post for deleting inbox messages for a particular friend. It must
   * be called only if local cache(friend.inbox) is populated.
   */
  deleteInboxMessages(friend) {
    var header = new Headers();
    header.append('Content-Type', 'application/json');

    /*
    * Once we populate our front-end with inbox messages, send a delete to
    *  DB.
    */
    let User: Friend = {
      id : friend.id,
    };
    this.http.post(environment.http_address+'/api/delete-inbox-msg',
      User, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
    });
  }

  onSelect(friend: Friend) {
    this.selected_friend = friend;
  }

  onSelectStranger(stranger) {
    this.selected_friend = stranger;
  }

  EnterChatBox(friend: Friend) {
    /*
    Emmit openchatbox event.
    */
    this.openchatbox.emit(friend);

    /************************************************
     * Chat box has oppened, so no unseen_messages. *
     ************************************************/
    friend.unseen_message = 0;
    friend.hasunseen_message = false;
  }
  EnterChatBoxStranger(stranger_clicked) {
    let stranger = new Friend();
    stranger.username = stranger_clicked;
    this.openchatbox.emit(stranger);
  }
}
