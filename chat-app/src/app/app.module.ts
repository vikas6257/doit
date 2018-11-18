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
    UserPageComponent
  ],
  /*Allow to add component dynamically i.e compile component before hand.*/
  entryComponents: [ChatboxComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [
    WebsocketService,
    ChatserviceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
