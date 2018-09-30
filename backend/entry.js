// Import all required libraries
var express = require("express");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var cors = require("cors");
var logger = require("node-logger").createLogger("backend.log");

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

connections = [];
/*
io.on('connection', (socket) => {

    connections.push(socket);
    logger.log('New user connected : '+socket.id);
    // Log whenever a user connects
    logger.log('Total user connected : '+connections.length);

    // Log whenever a client disconnects from our websocket server
    socket.on('disconnect', function(){
        logger.log('User disconnected : '+socket.id);
        connections.splice(connections.indexOf(socket), 1);
        logger.log('Total user connected : '+connections.length);
    });

    // When we receive a 'message' event from our client, print out
    // the contents of that message and then echo it back to our client
    // using `io.emit()`
    socket.on('message', (message) => {
        logger.log("Message Received: " + message);
        io.emit('message', {type:'new-message', text: message});
    });
});
*/

io.on('connection', (socket) => {
  connections.push(socket);
  logger.log('New user connected : '+socket.id);
  logger.log('Total user connected : '+connections.length);

  if (connections.length == 2) {
    logger.log('zzzzzzzzzz')
    connections[0].on("message", (message)=>{
      connections.forEach(print_socket);
      logger.log("Message Received: " + message + ' from socket : '+connections[0].id);
      logger.log('Sending message to : '+connections[1].id);
      connections[1].emit('message', {type: 'new-message', text: message});
    });
  }
  socket.on('disconnect', function(){
      logger.log('User disconnected : '+socket.id);
      connections.splice(connections.indexOf(socket), 1);
      logger.log('Total user connected : '+connections.length);
  });
});
function print_socket(value){
  logger.log('Print: '+value.id)
}
