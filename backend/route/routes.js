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
        res.json({msg: "Username exists", status: "0"});
      }
      else {
        let new_user_login = new user_login({
          username: req.body.username,
          password: req.body.password,
          gender:   req.body.gender
        });

        new_user_login.save((err, item)=>{
          if(err) {
            res.json(err);
          }
          else {
            res.json({msg: "Account created", status: "1"});
          }
        });
      }
    });
});

router.post ('/login', (req,res,next)=> {
    console.log(req);
    var found = false;

    user_login.findOne({username: req.body.username}, function(err, docs) {

      if(err) {
        res.json(err);
      }
      else if (docs && docs['password'] == req.body.password ) {

        for(var i=0; i < entry.active_users.length; i++) {
           if (entry.active_users[i].username == req.body.username) {
             found = true;
             break;
           }
        }

        if(!found)
           res.json({msg: "Succesfully logged in", status: "1"});
        else
          res.json({msg: "User is already loged in", status: "-1"});
      }
      else {
         res.json({msg: "User does not not exist", status: "0"});
      }
    });
});

router.get ('/active-users', (req,res,next)=> {
    console.log(req);
    active_users = {};

    for(var i=0; i < entry.active_users.length; i++) {

              active_users[entry.active_users[i].socket.id] =
                                entry.active_users[i].username;

     }

    res.json(active_users);
});


module.exports = router;
