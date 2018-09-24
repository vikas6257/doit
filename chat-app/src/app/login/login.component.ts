import { Component, OnInit , Input} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {Http, Headers } from '@angular/http';
import { Login } from '../login';
import { map } from 'rxjs/operators';
import { Routes, RouterModule, Router } from '@angular/router';
import { NgModule } from '@angular/core';
import { ChatBoxComponent } from '../chat-box/chat-box.component';

const ROUTES:Routes = [
  {path: 'chat', component: ChatBoxComponent}
]


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


@NgModule({
imports: [
  RouterModule.forRoot(ROUTES)
]})

export class LoginComponent implements OnInit {

  form: FormGroup;
  @Input() EnterAs:string;
  constructor(private http: Http) { }
  login_status = true;
  login_error_status = false;
  chat_box_status = false;

  AddUser(form) {
    console.log(form.value);
    let newUser: Login = {
      username : form.value.name,
      password: form.value.password,
    };

    var header = new Headers();
    header.append('Content-Type', 'application/json');
    if (this.EnterAs == 'User'){
      console.log(newUser);
      this.http.post('http://localhost:3000/api/login', newUser, {headers:header}).pipe(map(res => res.json())).subscribe(res => {
      this.chat_box_status = res['status']
      });

      if(this.chat_box_status == true) {
        this.login_status = false;
        this.login_error_status = true;
      }
      else {
        this.login_status = true;
        this.login_error_status = true;
      }
      console.log('Trying to login');
      console.log(this.login_status);
      console.log(this.chat_box_status);
    }
  }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(''),
      password: new FormControl('')
    });
  }
}
