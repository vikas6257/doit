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

//Map to hold all connected(to backend server) user.
const connected_users = new Map();

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
  let stranger_name = undefined;
  let match_found = false;
  logger.log('Checking to start chat');
  for (var [key, value] of connected_users) {
    if (newConnection.user_name != key && !value.isTalkingtoStranger) {
      logger.log('Match found with : '+key);
      match_found = true;
      stranger = value;
      stranger_name = key;
      break;
    }
  }
  if (match_found) {
    logger.log(socket.id + 'can chat to ' + stranger.socket.id);
    socket.on('message', (message)=>{
      stranger.socket.emit('message',{type:'message', text: message, user_name: newConnection.user_name});
    });
    stranger.socket.on('message', (message)=>{
      socket.emit('message',{type:'message', text: message, user_name: stranger_name});
    });

    newConnection.isTalkingtoStranger = true;
    stranger.isTalkingtoStranger = true;
    return true;
  }
  else {
    logger.log(socket.id + ' is alone. :(');
    return false;
  }
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
    connected_users.delete(newConnection.user_name);
    logger.log('Total user connected :' + connected_users.size);
  });

  socket.on('start-chat', function(){
    logger.log('User wants to start chat.');
    newConnection.isTalkingtoStranger = false;
    if (start_chat(newConnection)) {
      logger.log('returning true');
      newConnection.socket.emit('message', {type:'start-chat', text:true});
    }
    else {
      logger.log('returning false');
      newConnection.socket.emit('message', {type:'start-chat', text:false});
    }
  });

  socket.on('end-chat', function(){
    logger.log('User wants to end chat.');
  });
});



function print_socket(value){
  logger.log('Print: '+value.id)
}

module.exports.connected_users = connected_users;
