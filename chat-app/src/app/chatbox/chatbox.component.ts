import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  AddUser() {
    console.log('Pressed + button.');
  }
  MinimizeWindow() {
    console.log('Pressed Minimize');
  }
  MaximizeWindoe() {
    console.log('Pressed Maximize');
  }
  CloseWindow() {
    console.log('Pressed Close');
  }
}
