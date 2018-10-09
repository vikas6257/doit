var express = require("express");
var router = express.Router();
var cors = require("cors");
var logger = require("node-logger").createLogger("backend_route.log");

let entry = require("../entry");

const user_login = require("../model/login");
var active_users = {};

router.post ('/register', (req,res,next)=> {

    user_login.findOne({username: req.body.username}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else if (docs){
        flag = 0;
        res.json({msg: "Username exists"});
      }
      else {
        let new_user_login = new user_login({
          username: req.body.username,
          password: req.body.password
        });

        new_user_login.save((err, item)=>{
          if(err) {
            res.json(err);
          }
          else {
            res.json({msg: "Account created"});
          }
        });
      }
    });
});

router.post ('/login', (req,res,next)=> {
    console.log(req);

    user_login.findOne({username: req.body.username}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else if (docs && docs['password'] == req.body.password){
        res.json({msg: "Succesfully logged in", status: "1"});
      }
      else {
         res.json({msg: "User does not not exist", status: "0"});
      }
    });
});

router.get ('/active-users', (req,res,next)=> {
    console.log(req);
    active_users = {};

    for(var i=0; i < entry.alone_connections.length; i++) {

              active_users[entry.alone_connections[i].socket.id] =
                                entry.alone_connections[i].username;

     }

     for(var i=0; i < entry.talking_connections.length; i++) {

               active_users[entry.talking_connections[i].socket.id] =
                                 entry.talking_connections[i].username;
    
     }

    res.json(active_users);
});


module.exports = router;
