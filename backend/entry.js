// Import all required libraries
var express = require("express");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var cors = require("cors");
var logger = require("node-logger").createLogger("backend_entry.log");

/*******************************************************************/
/*                            MIIDLEWARE                           */
/*******************************************************************/
//instantiate express
var app = express();

//import route module
const route = require("./route/routes");

//connect to mongo db server
//TODO: Verify whether DB Name is required
mongoose.connect('mongodb://localhost:27017/')

//on succesful connection
mongoose.connection.on('connected', ()=> {
  console.log('Backend has been connected to Mongo DB server at port 27017');
});

//on connection error
mongoose.connection.on('error', (err)=> {
  console.log(err);
});

//port used for backend server
const port = 3000;


//middleware
app.use(cors({origin : "http://localhost:4200", credentials : true}));
app.use(bodyparser.json());
app.use('/api',   route);


let http = require('http').Server(app);

//Start back end server
var server = app.listen(port, ()=>{
  logger.info('Backend server started at port : '+port);
});

let io = require('socket.io').listen(server)

/*Global varaibles*/

const connection = {
  socket:undefined,
  user_name:undefined,
  friends:undefined,
  isTalkingtoStranger:true,
};

//Map to hold all connected user as connection object.
const connected_users = new Map();

//list to hold users pending to assign a stranger for chat. Just contains userid
pending_users = [];

 /************************************************************************/
 /*                         APIS                                         */
 /************************************************************************/
 function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/********************************************************************************************/
/* Message types:-                                                                          */
/* message-admin : - It is used to communicate admin-level data between server & client.    */
/* message:-         It is used to communicate chat messages between end users, so user-id  */
/*                   must be included in the body of message when we recieve it from client */
/*                   to properly redirect it to the intended user.                          */
/********************************************************************************************/
io.on('connection', (socket) => {
  const newConnection = Object.create(connection);

  socket.on("user_id", (message)=>{
    newConnection.socket = socket;
    newConnection.user_name = message;
    connected_users.set(message, newConnection);
    logger.log('User got connected :' + message);
    logger.log('Total user connected :' + connected_users.size);
  });

  socket.on('disconnect', function(){
    logger.log('User got disconnected :'+newConnection.user_name);
    pending_users.splice(pending_users.indexOf(newConnection.user_name), 1);
    connected_users.delete(newConnection.user_name);
    logger.log('Total user connected :' + connected_users.size);
  });

  /********************************************************************************************/
  /*                       COMMON MESSAGING INFRA                                             */
  /*  1. For messsages to friend, we always ensure that conncetion is alive at frontend       */
  /*     else we do a DB post of offline messages.                                            */
  /*  2. For messages to stranger, if starnger1 closes the chatbox, he/she will anyway lose   */
  /*     the starnger2 details on closure of chat box. So he/she can't send messagess to      */
  /*     starnger2. But Stranger 2 can send false messages to stranger1 as he/she is still    */
  /*     holding stranger1 details. So to resolve this we send 'end-chat' per starnger basis  */
  /*     so that if one starnger closes chatbox, another stanger's chatbox should             */
  /*     automatically be closed.                                                             */
  /********************************************************************************************/
  socket.on('message', (message)=>{
      logger.log('Got a new message:'+message['msg']+ 'from:' + newConnection.user_name);
      connection_peer =  connected_users.get(message['to']);
      /*Must always be true*/
      if(connection_peer != undefined) {
        logger.log(' Sendinge message to '+ connection_peer.user_name);
        connection_peer.socket.emit('message',{type:'message', text: message['msg'],
                            from: newConnection.user_name});
      }
    });


    /********************************************************************************************/
    /*                       STRANGER ASSIGNMENT INFRA                                          */
    /*  1. On recieving 'start-chat', map a user from pending-list                              */
    /*  2. If pending-list is empty, push this request into that list and try to fulfill        */
    /*     or map it when another user comes.                                                   */
    /*  3. Send 'assigned-user' to init chatbox at frontend                                     */
    /*  4. On recieving 'end-chat', send 'delete-stranger' to delete chatbox at frontend.       */
    /********************************************************************************************/
    socket.on('start-chat', function() {
      if(pending_users.length > 0) {
        //assign a user
        strangerIndex =  getRandomInt(pending_users.length);
        strangerId = pending_users[strangerIndex];
        pending_users.splice(strangerIndex, 1);
        //send message to stranger1
        socket.emit('message',{type:'assigned-stranger',
                  userId:   strangerId});
        stranger_peer =  connected_users.get(strangerId);
        /*Must always be true*/
        if(stranger_peer != undefined) {
            //send message to stranger2
            stranger_peer.socket.emit('message',{type:'assigned-stranger',
                            userId: newConnection.user_name});
          }
      }
      else {
        pending_users.push(newConnection.user_name);
      }
    });

    socket.on('end-chat', (message)=> {
      stranger_peer =  connected_users.get(message['to']);
      if(stranger_peer != undefined) {
          stranger_peer.socket.emit('message',{type:'delete-stranger',
                          userId: newConnection.user_name});
        }
    });

});

module.exports.connected_users = connected_users;
