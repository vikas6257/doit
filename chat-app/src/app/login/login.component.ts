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
  login_status:boolean = true;
  login_error_status:boolean = false;
  chat_box_status:boolean = false;

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

      if(this.chat_box_status = true) {
        this.login_status = false;
        this.login_error_status = false;
        this.router.navigate(['/chat']);
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
