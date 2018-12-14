import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  reset: boolean;
  title = 'openup';
  EnterAs:string = 'NA';

  EnterChatUser() {
    this.EnterAs = 'User';
  }

  EnterChatGuest() {
    this.EnterAs = 'Guest';
  }

  ngOnInit()  {
    this.EnterAs = 'User';
    this.reset = true;
  }

}
