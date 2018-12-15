import { Component, OnInit , Input, ViewEncapsulation} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {Http, Headers } from '@angular/http';
import { Login } from '../login';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class LoginComponent implements OnInit {

  form: FormGroup;
  form_register: FormGroup;

  @Input() EnterAs:string;
  constructor(private http: Http, private router: Router) { }
  /*
   * Global friend list . It will be imported to active-user component
  * to populate.
  */
  friend_list = [];

  /*
   * Global variable to hold user's login handle. It will be imported to other
   * components too.
   */
  login_handle ="";

  /*Local variables used within the component.*/
  login_status = true;
  login_error_status = false;
  login_error_msg = "";

  register_status = true;
  register_error_status = false;
  register_error_msg = "";

  status = 0;
  chat_box_status = false;

  showSpinner = false;

  AddUser(form) {
    this.showSpinner = true;
    let newUser: Login = {
      username : form.value.name,
      password: form.value.password,
    };

    this.login_handle = form.value.name;

    var header = new Headers();
    header.append('Content-Type', 'application/json');
    if (this.EnterAs == 'User'){
      this.login_handle = form.value.name;
      this.http.post(environment.http_address+'/api/login', newUser, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {
        this.showSpinner = false;
        this.status = res['status'];

        if(this.status == 1) {
          this.chat_box_status = true;
          this.login_status = false;
          this.register_status = false;
          this.login_error_status = false;
          this.register_error_status = false;
          this.router.navigate(['/chat'], { skipLocationChange: true });
        }
        else if (this.status == 0){
          this.login_status = true;
          this.register_status = true;
          this.login_error_status = true;
          this.register_error_status = false;
          this.chat_box_status = false;
          this.login_error_msg = "Username or password is wrong.";
        }
        else {
          this.login_status = true;
          this.login_error_status = true;
          this.chat_box_status = false;
          this.register_status = true;
          this.register_error_status = false;
          this.login_error_msg = "User is already logged in.";
        }

      });
    }
  }


  AddNewUser(form_register) {
    this.showSpinner = true;
    if(form_register.value.password != form_register.value.confirm_password) {
      this.register_error_msg = "Password entered in password and Retype password section is not same";
      this.login_status = true;
      this.login_error_status = false;
      this.chat_box_status = false;
      this.register_status =  true;
      this.register_error_status = true;
      this.showSpinner = false;
    }
    else if (this.EnterAs == 'User'){
      let newUser: Login = {
        username : form_register.value.name,
        password: form_register.value.password,
        gender: form_register.value.gender,
      };

      this.login_handle = form_register.value.name;

      var header = new Headers();
      header.append('Content-Type', 'application/json');

      this.login_handle = form_register.value.name;
      this.http.post(environment.http_address+'/api/register', newUser, {headers:header}).pipe(map(res => res.json())).subscribe((res) => {

        this.status = res['status'];
        this.showSpinner = false;
        if(this.status == 1) {
          this.chat_box_status = true;
          this.login_status = false;
          this.login_error_status = false;
          this.register_error_status = false;
          this.register_status =  false;
          this.router.navigate(['/chat']);
        }
        else {
          this.login_status = true;
          this.login_error_status = false;
          this.chat_box_status = false;
          this.register_status =  true;
          this.register_error_status = true;
          this.register_error_msg = "User name already exists. Plese try with "
                                    +"some different user name :)";
        }

      });
    }
  }


  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(''),
      password: new FormControl('')
    });

    this.form_register = new FormGroup({
      name: new FormControl(''),
      password: new FormControl(''),
      confirm_password: new FormControl(''),
      gender: new FormControl('male')
    });
  }

  ngOnDestroy() {
    this.login_handle = "";
    this.friend_list.length = 0;
  }

}
