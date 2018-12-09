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
    console.log(this.EnterAs);
  }

  EnterChatGuest() {
    this.EnterAs = 'Guest';
    console.log(this.EnterAs);
  }

  ngOnInit()  {
    this.reset = true;
    this.EnterAs = 'User';
  }

}
