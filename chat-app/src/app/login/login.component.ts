import { Component, OnInit , Input} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {Http, Headers } from '@angular/http';
import { Login } from '../login';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent implements OnInit {

  form: FormGroup;
  @Input() EnterAs:string;
  constructor(private http: Http, private router: Router) { }

  login_status = true;
  login_error_status = false;
  chat_box_status = false;
  status = 0;
  login_handle ="";

  AddUser(form) {
    //debug
    console.log(form.value);
    let newUser: Login = {
      username : form.value.name,
      password: form.value.password,
    };

    this.login_handle = form.value.name;

    var header = new Headers();
    header.append('Content-Type', 'application/json');
    if (this.EnterAs == 'User'){
      //debug
      console.log('Trying to login');
      console.log("Existing user with data: "+ newUser);
      this.login_handle = form.value.name;
      this.http.post('http://localhost:3000/api/login', newUser, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {

        this.status = res['status'];

        if(this.status == 1) {
          this.chat_box_status = true;
          this.login_status = false;
          this.login_error_status = false;
          this.router.navigate(['/chat']);
        }
        else {
          this.login_status = true;
          this.login_error_status = true;
          this.chat_box_status = false;
        }

      });
    }
  }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(''),
      password: new FormControl('')
    });
  }
}
