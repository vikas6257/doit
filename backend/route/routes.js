var express = require("express");
var router = express.Router();
var cors = require("cors");
var logger = require("node-logger").createLogger("backend_route.log");
var ObjectId = require('mongodb').ObjectID;

let entry = require("../entry");

const schema = require("../model/schema");

router.post ('/register', (req,res,next)=> {

    schema.loginschema.findOne({username: req.body.username}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else if (docs){
        res.json({msg: "Username exists", status: "0"});
      }
      else {
        let new_user_login = new schema.loginschema({
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
    var found = false;

    schema.loginschema.findOne({username: req.body.username}, function(err, docs) {

      if(err) {
        res.json(err);
      }
      else if (docs && docs['password'] == req.body.password ) {
        if(!entry.connected_users.has(req.body.username))
           res.json({msg: "Succesfully logged in", status: "1"});
        else
          res.json({msg: "User is already loged in", status: "-1"});
      }
      else {
         res.json({msg: "User does not not exist", status: "0"});
      }
    });
});

/*Client needs to send message as
 ----------------------------------------
!  username: "name",                    !
!  friend_username: "friend's name",    !
!  friend_gender: "friend's gender",    !
 ---------------------------------------
*/
router.post ('/add-user-fl', (req,res,next)=> {

    schema.loginschema.findOne({username: req.body.username}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else {
        let new_friend = new schema.friendlistschema({
          username: req.body.friend_username,
          gender: req.body.friend_gender
        });

        new_friend.save((err, item_f)=>{
          if(err) {
            res.json(err);
          }
          else {
            local_user = entry.connected_users.get(req.body.username);
            if (local_user) {
               local_user.friends.push(req.body.friend_username);
            }

            docs.friendlist.push(item_f._id);
            docs.save((err, item)=>{
              if(err) {
                res.json(err);
              }
              else {
                /*Make sure to send uid back to the client*/
                  res.json({"msg": "Friend added", "id": item_f._id});
              }
            });
          }
        });
      }
    });
});

router.post ('/get-user-fl', (req,res,next)=> {
    schema.loginschema.findOne({username: req.body.username}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else {
        local_user = entry.connected_users.get(req.body.username);
        schema.friendlistschema.find( {_id: {$in:docs.friendlist} }, function (err, result) {
        for(var i=0;i<result.length;i++) {
          if(entry.connected_users.get(result[i].username) != undefined) {
            result[i].onlinestatus = "true";
          }
          else{
            result[i].onlinestatus = "false";
          }
          if (local_user) {
             local_user.friends.push(result[i].username);
          }
        }
        res.json({"User":result});
        });
      }
    });
});

/*
 ------------------------------------
!  Client needs to send message as  !
!  username: "name",                !
!  friend_username: "name",         !
!  friend_id : "uid"                !
 -----------------------------------
*/
router.post ('/delete-user-fl', (req,res,next)=> {
    schema.loginschema.findOne({username: req.body.username}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else {
        docs.friendlist.splice(docs.friendlist.indexOf(ObjectId(req.body.friend_id)),1);

        docs.save((err, item)=>{
          if(err) {
            res.json(err);
          }
        });

        local_user = entry.connected_users.get(req.body.username);
        if (local_user) {
           local_user.friends.splice(req.body.friend_username, 1);
        }

        //TODO: Before deleting friendlist row, delete all rows corresponding
       //      to uuids present in inbox list
        schema.friendlistschema.deleteOne(ObjectId(req.body.friend_id), function (err, result) {
          if (err) {
            res.json(err);
          }
          else {
            res.json({"msg": "Friend deleted"});
          }
        });
      }
    });
});


/*
 ------------------------------------
!  Client needs to send message as  !
!  id: "uid",                       !
!  timestamp : "uid"                !
!  text : ""                        !
 -----------------------------------
*/
router.post ('/send-inbox-msg', (req,res,next)=> {

    schema.friendlistschema.findOne({_id: ObjectId(req.body.id)}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else {
         let msg = new schema.inboxmessageschema({
           timestamp: req.body.timestamp,
           text: req.body.text
         });

         msg.save((err, item)=> {
           if(err) {
             res.json(err);
           }
           else {
             docs.inbox.push(item._id);
             docs.save((err, item_m)=>{
               if(err) {
                 res.json(err);
               }
               else {
                    res.json({"msg": "Message sent."});
               }
             });
           }
         });
      }
    });
});


/*
 ------------------------------------
!  Client needs to send message as  !
!  id: "uid",                       !
 -----------------------------------
*/
router.post ('/get-inbox-msg', (req,res,next)=> {
    msg = [];
    logger.log('Something went wrong while deleting messages for a user');
    schema.friendlistschema.findOne({_id: ObjectId(req.body.id)}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else {
        if(docs.inbox != undefined) {
          /*Delete all messages once user read it*/
            schema.inboxmessageschema.find( {_id: {$in:docs.inbox} }, function (err, result) {
              if (err) {
                res.json(err);
              }
              else {
                res.json(result);
              }
            });
          }
      }
    });
});


/*
 ------------------------------------
!  Client needs to send message as  !
!  id: "uid",                       !
 -----------------------------------
*/
router.post ('/delete-inbox-msg', (req,res,next)=> {

    schema.friendlistschema.findOne({_id: ObjectId(req.body.id)}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else {

         if(docs.inbox != undefined) {
           /*Delete all messages once user read it*/
           for(var i=0;i<docs.inbox.length;i++) {
             schema.inboxmessageschema.deleteOne({_id: docs.inbox[i]}, function (err, result) {
               if (err) {
                 logger.log('Something went wrong while deleting messages for a user');
               }
             });
           }
           docs.inbox = [];
           docs.save((err, item)=> {
             if(err) {
               res.json(err);
             }
             else {
               res.json({"msg": "Succesfully deletd message"});
             }
           });
         }
      }
    });
});



module.exports = router;
