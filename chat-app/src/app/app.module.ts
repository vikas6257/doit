import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { HeadingComponent } from './heading/heading.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { HttpModule } from '@angular/http'
import { LoginComponent } from './login/login.component';
import { WebsocketService } from './websocket.service'
import { ChatserviceService } from './chatservice.service'
import 'rxjs';
import { ActiveUsersComponent } from './active-users/active-users.component';
import { ChatboxComponent } from './chatbox/chatbox.component';

const ROUTES:Routes = [
  {path: 'chat', component: ChatBoxComponent},
  {path: 'logout', component: AppComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    ChatBoxComponent,
    HeadingComponent,
    ChatWindowComponent,
    LoginComponent,
    ActiveUsersComponent,
    ChatboxComponent
  ],
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
