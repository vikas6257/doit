import { Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fr_req_dialog } from '../user-page/user-page.component'
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-friend-req',
  templateUrl: './friend-req.component.html',
  styleUrls: ['./friend-req.component.css']
})
export class FriendReqComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
  }

  accept_fr_req(user, friend_req) {
    friend_req.compref.instance.FriendRequestAccepted();
    this.data.friend_req.delete(user);
  }

  reject_fr_req(user, friend_req) {
    friend_req.compref.instance.FriendRequestRejected();
    this.data.friend_req.delete(user);
  }
}
