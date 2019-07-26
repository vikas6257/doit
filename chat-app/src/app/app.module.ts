import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HttpModule } from '@angular/http'
import { LoginComponent } from './login/login.component';
import { WebsocketService } from './websocket.service'
import { ChatserviceService } from './chatservice.service'
import 'rxjs';
import { ActiveUsersComponent } from './active-users/active-users.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { UserPageComponent } from './user-page/user-page.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatIconModule,
  MatMenuModule,
  MatRippleModule,
  /*For printing number on a button*/
  MatBadgeModule,
  /*For material list*/
  MatListModule,
  MatButtonModule,
  MatDividerModule,
  MatDialogModule,
  MatSnackBarModule,
  MatTabsModule
} from '@angular/material';
import { FriendReqComponent } from './friend-req/friend-req.component';
import { UserConfirmationComponent } from './user-confirmation/user-confirmation.component';

const ROUTES:Routes = [
  {path: 'chat', component: UserPageComponent},
  {path: 'logout', component: AppComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ActiveUsersComponent,
    ChatboxComponent,
    UserPageComponent,
    SpinnerComponent,
    FriendReqComponent,
    UserConfirmationComponent,
  ],
  /*Allow to add component dynamically i.e compile component before hand.*/
  entryComponents: [ChatboxComponent, FriendReqComponent, UserConfirmationComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES),
    BrowserAnimationsModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    MatBadgeModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  providers: [
    WebsocketService,
    ChatserviceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
