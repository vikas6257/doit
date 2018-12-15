// Import all required libraries
var express = require("express");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var cors = require("cors");
var logger = require("node-logger").createLogger("backend_entry.log");
var multer = require('multer');
const path = require('path');

/*******************************************************************/
/*                            MIIDLEWARE                           */
/*******************************************************************/
//instantiate express
var app = express();

//import route module
const route = require("./route/routes");

//connect to mongo db server
//TODO: Verify whether DB Name is required
const db_uri = 'mongodb://'+process.env.DB_USERNAME+':'+process.env.DB_PASS+'@'+process.env.DB_HOST+':'+process.env.DB_PORT+'/'+process.env.DB_NAME
console.log(db_uri);
mongoose.connect(db_uri, { useNewUrlParser: true })

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
app.use(cors({origin : "http://"+process.env.NODE_HOST+process.env.NODE_PORT, credentials : true}));
app.use(bodyparser.json());
app.use('/api',   route);

let http = require('http').Server(app);

//Start back end server
var server = app.listen(port, ()=>{
  logger.info('Backend server started at : '+process.env.NODE_HOST+':'+process.env.NODE_PORT);
  console.log('Backend server started at : '+process.env.NODE_HOST+':'+process.env.NODE_PORT);
});

let io = require('socket.io').listen(server)

/*connection object*/
let connection = {
  socket:undefined,
  user_name:undefined,
  friends:[], //dynamic field consists of username of friends
  talking_to_stranger:[], //dynamic field
};

//Map to hold all connected user as connection object.
var connected_users = new Map();

//list to hold users pending to assign a stranger for chat. Just contains userid
var pending_users = [];

 /************************************************************************/
 /*                         APIS                                         */
 /************************************************************************/


 /************************************************************************/
 /*               PROFILE PIC UPLOAD                                     */
 /*   Profile pic of user will be uploaded to the memory with name as    */
 /*  "user-id.img". That's why we don't need to create cache in DB as we */
 /*   are sure how to fetch profile pic for each user.                   */
 /************************************************************************/
 var Storage = multer.diskStorage({
     destination: function(req, file, callback) {
         callback(null, "./uploads");
     },
     filename: function(req, file, callback) {
         logger.log(req);
         callback(null, file.fieldname);
     }
 });

  var upload = multer({
      storage: Storage,
      files: 1,
      fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only png, jpg & jpeg images are allowed'))
        }
        callback(null, true)
      },
      limits:{
        fileSize: 1024 * 1024
      }
  }).any();

  app.post("/add", function (req, res) {
    upload(req, res, function(err) {
         if (err) {
             return res.json({"msg": "Something went wrong!" });
         }
         return res.json({"msg": "File uploaded sucessfully!."});
     });
   });

   app.get('/uploads/:username', function(req, res) {
     res.sendFile(__dirname + "/uploads/" + req.params.username);
   });

 /************************************************************************/
 /* To generate random index                                             */
 /************************************************************************/
 function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/************************************************************************/
/* To send a message 'friend_online' to all online friends              */
/************************************************************************/
function fireOnlineStatus(user) {
  for(let i = 0;i<user.friends.length;i++) {
    online_friend = connected_users.get(user.friends[i]);
    // Emit message only to online friends that I am now online
    if(online_friend) {
      online_friend.socket.emit('message',{type:'friend_online',
                        friend: user.user_name});
    }
  }
}

/************************************************************************/
/* To get a stranger. Currently its working on FCFS algo.               */
/* Need to come up with more optimised logic.                           */
/************************************************************************/
function getStranger(user) {
  for(let i = 0;i < pending_users.length;i++) {
    /*Check if user in pending list in not my firend or already talking to*/
    if(user.friends.includes(pending_users[i]) == false &&
       user.talking_to_stranger.includes(pending_users[i]) == false) {
         return i;
    }
  }
  return -1;
}

/*****************************************************************************/
/*  Debug API                                                                */
/*****************************************************************************/
function dump_tables() {
  logger.log("----------------");
  for (let entry of connected_users.entries()) {
      var key = entry[0],
      user = entry[1];

      logger.log("Local DB for user: ",user.user_name);
      for(let i=0;i<user.friends.length;i++) {
        logger.log("My Friend is: "+user.friends[i]);
      }
      for(let i=0;i<user.talking_to_stranger.length;i++) {
        logger.log("My talking_to_strangeris: "+user.talking_to_stranger[i]);
      }
  }
  for(let i=0;i<pending_users.length;i++) {
      logger.log("Pendng users are: "+pending_users[i]);
  }
  logger.log("----------------");
}

/********************************************************************************************/
/* Message types:-                                                                          */
/* message-admin : - It is used to communicate admin-level data between server & client.    */
/* message:-         It is used to communicate chat messages between end users, so user-id  */
/*                   must be included in the body of message when we recieve it from client */
/*                   to properly redirect it to the intended user.                          */
/********************************************************************************************/
io.on('connection', (socket) => {
  let newConnection = Object.create(connection);

  socket.on("user_id", (message)=>{
    newConnection.socket = socket;
    newConnection.user_name = message;
    newConnection.friends = new Array();
    newConnection.talking_to_stranger = new Array();
    connected_users.set(message, newConnection);
    logger.log('User got connected :' + message);
    logger.log('Total user connected :' + connected_users.size);
  });

  /* Message 'i_am_online' will be send by client to trigger his/her online chat_end_status
     to online friends.*/
  socket.on("i_am_online", (message)=>{
      fireOnlineStatus(newConnection);
  });

  socket.on('disconnect', function(){
    //Traverse through all friends in the list and emit offline message
    for(let i =0;i<newConnection.friends.length;i++) {
      // Get connection object from friend_list entry
      online_friend = connected_users.get(newConnection.friends[i]);
      // Emit message to only online friends that I am going offline
      if(online_friend) {
        online_friend.socket.emit('message',{type:'friend_offline',
                          friend: newConnection.user_name});
      }
    }

      //Traverse through all starngers in the list and emit delete starnger
      for(let i =0;i<newConnection.talking_to_stranger.length;i++) {
        // Get connection object from talking_to_stranger entry
        stranger_friend = connected_users.get(newConnection.talking_to_stranger[i]);
        // Emit message to only online friends that I am going offline
        if(stranger_friend) {
          stranger_friend.socket.emit('message',{type:'delete-stranger',
                          userId: newConnection.user_name});
        }

    }

    /*TODO:- Confirm whether deleteion of friend list is required ? As we are deleting
             the entire object.*/

    newConnection.friends.length = 0;
    /* When an user disconnects, remove that user from talking_to_stranger list of all
     * other users to whom he/she was talking.*/
    for(let i= 0; i < newConnection.talking_to_stranger.length;i++) {
      my_stranger = connected_users.get(newConnection.talking_to_stranger[i]);
      /* We may want to notify all other users to whom this user was talking with
       * as starnger.*/
      my_stranger.talking_to_stranger.splice(
        my_stranger.talking_to_stranger.indexOf(newConnection.user_name), 1);
    }
    newConnection.talking_to_stranger.length = 0;
    pending_users.splice(pending_users.indexOf(newConnection.user_name), 1);
    connected_users.delete(newConnection.user_name);
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
      connection_peer =  connected_users.get(message['to']);
      /*Must always be true*/
      if(connection_peer != undefined) {
        dump_tables();
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
        let strangerIndex = -1;
        strangerIndex =  getStranger(newConnection);
        if(strangerIndex >= 0) {
          strangerId = pending_users[strangerIndex];
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
            newConnection.talking_to_stranger.push(strangerId);
            stranger_peer.talking_to_stranger.push(newConnection.user_name);
            pending_users.splice(pending_users.indexOf(strangerId), 1);
        }
        else {
            pending_users.push(newConnection.user_name);
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
          newConnection.talking_to_stranger.splice(
            newConnection.talking_to_stranger.indexOf(stranger_peer.user_name) ,1);
          stranger_peer.talking_to_stranger.splice(
            stranger_peer.talking_to_stranger.indexOf(newConnection.user_name) ,1);
        }
    });


    /********************************************************************************************/
    /*                       COMMON ADD FRIEND INFRA                                            */
    /********************************************************************************************/
    socket.on('send-friend-request', (message)=> {
       friend_request_for_peer = connected_users.get(message['to']);
       //assert
       if(newConnection.talking_to_stranger.includes(friend_request_for_peer.user_name)
          == false) {
           logger.log("ERROR: Sending friend request for user other than my strangers");
       }
       friend_request_for_peer.socket.emit('message',{type:'recieve-friend-request',
                       'from': newConnection.user_name});
    });

    socket.on('friend-request-accepted', (message)=> {
       friend_request_accepted_for_peer = connected_users.get(message['to']);
       friend_request_accepted_for_peer.socket.emit('message',{type:'friend-request-approved',
                       'from': newConnection.user_name, 'id': message['id']});
    });

    socket.on('friend-request-rejected', (message)=> {
       friend_request_rejected_for_peer = connected_users.get(message['to']);
       friend_request_rejected_for_peer.socket.emit('message',{type:'friend-request-declined',
                       'from': newConnection.user_name});
    });

});

module.exports.connected_users = connected_users;
