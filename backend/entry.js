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
  username:undefined,
};

 alone_connections = [];
 talking_connections = [];

 /************************************************************************/
 /*                         APIS                                         */
 /************************************************************************/
 function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

 function get_stranger_to_talk() {
  return (alone_connections[getRandomInt(alone_connections.length)]);
}

 function start_chat(newConnection) {
  socket = newConnection.socket;
  let stranger = undefined;
  let match_found = false;
  logger.log('Checking to start chat')
   while ((stranger == undefined || socket == stranger.socket) && alone_connections.length >= 2) {
      stranger = get_stranger_to_talk();
      match_found = true;
  }
  if (match_found) {
    logger.log(socket.id + 'can chat to ' + stranger.socket.id);
    socket.on('message', (message)=>{

      stranger.socket.emit('message',{type:'new-message', text: message});
    });
    stranger.socket.on('message', (message)=>{
      socket.emit('message',{type:'new-message', text: message});
    });
    //Transfer connected socket from alone_connections to talking_connections
     alone_connections.splice(alone_connections.indexOf(stranger), 1);
     talking_connections.push(stranger);
     talking_connections.push(newConnection);
     alone_connections.splice(alone_connections.indexOf(newConnection), 1);
  }
  else {
    logger.log(socket.id + ' is alone. :(');
  }
}


/**************************************************************************/
/*   Message type-  (EMIT)                                                */
/*                  new-message1 ---> used to get                         */
/*                                            delete user-id              */
/*                                            add user-id                 */
/*                  new-message ----> used to send chat message.          */
/*                                                                        */
/*                  (RECEIVE)                                             */
/*                    admin-message ---> used to get user-id              */
/*                    message       ---> used to rcv chat message.        */
/*  We should always check message type at frontend to distinguish.       */
/**************************************************************************/
io.on('connection', (socket) => {
  const newConnection = Object.create(connection);
  newConnection.socket = socket;
  alone_connections.push(newConnection);

  /*Once socket gets created, send message of type new-message-1 to get user-id
    from front end to map it with socket-id*/
  socket.emit('message', {type: 'new-message1', text: "send-user-id"});
  /*Wait for reply , and check message has key "sent-user-id"*/
  socket.on("message-admin", (message)=>{
    /*Check if json has key as "sent-user-id", as it signifies
      frontend has successfully sent user-id*/

    if(message["sent-user-id"] != undefined) {
      logger.log("Socket id:" + socket.id, newConnection.socket.id );
      newConnection.username = message['sent-user-id'];

      /*Once we receive reply from front end , send this new user to
      all clients.*/
      for (var i =0;i<alone_connections.length;i++) {
         alone_connections[i].socket.emit('message', {
              type: 'new-message1',
              text: "add-user-id",
              value:message['sent-user-id']});
      }

      for (var i =0;i<talking_connections.length;i++) {
        talking_connections[i].socket.emit('message', {
              type: 'new-message1',
              text: "add-user-id",
              value:message['sent-user-id']});
      }

    }
  });

  socket.on('disconnect', function(){

      alone_connections.splice(alone_connections.indexOf(newConnection), 1);
      talking_connections.splice(talking_connections.indexOf(newConnection), 1);

      /*Once socket gets deleted, send message of type new-message-1 to delete user-id
      from front end*/
      for (var i =0;i<alone_connections.length;i++) {
        alone_connections[i].socket.emit('message', {type: 'new-message1',
          text: "delete-user-id",
          value: newConnection.username});
      }

      for (var i =0;i<talking_connections.length;i++) {
        talking_connections[i].socket.emit('message', {type: 'new-message1',
          text: "delete-user-id",
          value: newConnection.username});
      }

  });

  start_chat(newConnection);
});



function print_socket(value){
  logger.log('Print: '+value.id)
}

module.exports.alone_connections = alone_connections;
module.exports.talking_connections = talking_connections;
