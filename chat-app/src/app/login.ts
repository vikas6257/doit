/*Schema to hold user specific info. It is basically used for login and
  new user registration.*/
export class Login{
  _id?: string;
  username: string;
  password: string;
  gender? : string;
}
