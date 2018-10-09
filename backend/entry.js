// Import all required libraries
var express = require("express");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var cors = require("cors");
var logger = require("node-logger").createLogger("backend.log");

//instantiate express
var app = express();

const connection = {
  socket:undefined,
  username:undefined,
};

alone_connections = [];
talking_connections = [];

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function get_stranger_to_talk() {
  return (alone_connections[getRandomInt(alone_connections.length)]);
}

function start_chat(socket) {
  let stranger = undefined;
  let match_found = false;
  logger.log('Checking to start chat')

  while ((stranger == undefined || socket == stranger.socket) && alone_connections.length >= 2) {
      stranger = get_stranger_to_talk();
      match_found = true;
  }
  if (match_found) {
    logger.log(socket.id + 'can cat to ' + stranger.socket.id);
    socket.on('message', (message)=>{
      stranger.socket.emit('message',{type:'new-message', text: message});
    });
    stranger.socket.on('message', (message)=>{
      socket.emit('message',{type:'new-message', text: message});
    });
    //Remove connected socket from alone_connections to talking_connections

    alone_connections.splice(alone_connections.indexOf(stranger), 1);
    talking_connections.push(stranger);

    alone_connections.splice(alone_connections.indexOf(socket), 1);
    talking_connections.push(socket);
  }
  else {
    logger.log(socket.id + ' is alone. :(');
  }
}

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

io.on('connection', (socket) => {
  const newConnection = Object.create(connection);
  newConnection.socket = socket;

  alone_connections.push(newConnection);
  logger.log('New user connected : '+socket.id);
  logger.log('Total user connected : '+(alone_connections.length+talking_connections.length));

  socket.on('disconnect', function(){
      logger.log('User disconnected : '+socket.id);
      alone_connections.splice(alone_connections.indexOf(newConnection), 1);
      logger.log('Total user connected : '+(alone_connections.length+talking_connections.length));
  });

  start_chat(socket);
});
function print_socket(value){
  logger.log('Print: '+value.id)
}
