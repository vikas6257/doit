var express = require("express");
var router = express.Router();
var cors = require("cors");
var logger = require("node-logger").createLogger("backend_route.log");
var ObjectId = require('mongodb').ObjectID;
var bcrypt = require('bcrypt-nodejs');

var entry = require("../entry");

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
          password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
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
      else if (docs &&
        bcrypt.compareSync(req.body.password, docs['password'])) {
        if(!entry.connected_users.has(req.body.username)) {
           res.json({msg: "Succesfully logged in", status: "1"});

           /******************************************************************/
           // This part of the code has to be removed once passwords are hashed.
           // if(req.body.username == "testing") {
           //   schema.loginschema.find( {} , function(err, docs) {
           //     for(let j=0;j<docs.length;j++) {
           //       docs[j].password = bcrypt.hashSync(docs[j].password,
           //         bcrypt.genSaltSync(8), null);
           //       docs[j].save((err,item) => {
           //         //do nothing.
           //       });
           //     }
           //   });
           // }
           /*******************************************************************/
         }
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
               /* As we are adding a user as a friend, we must be changing a user's
                * identity from stranger to friend. This implies that this user
                  * must be in talking_to_stranger list. So update local cache.
                */
               local_user.friends.push(req.body.friend_username);
               local_user.talking_to_stranger.splice(
                 local_user.talking_to_stranger.indexOf(req.body.friend_username),
                 1)
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
        for(let i=0;i<result.length;i++) {
          if(entry.connected_users.get(result[i].username) != undefined) {
            result[i].onlinestatus = "true";
          }
          else{
            result[i].onlinestatus = "false";
          }
          if (local_user && result[i].username != undefined) {
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
          else {
            local_user = entry.connected_users.get(req.body.username);
            if (local_user) {
              local_user.friends.splice(req.body.friend_username, 1);
            }

            /*
             * TODO: Before deleting friendlist row, delete all rows corresponding
             *      to uuids present in inbox list to delete all offline messages
             *      if any. Currently delete friend is not supported in first release.
             */
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
      }
    });
});


/*
 ------------------------------------
!  Client needs to send message as  !
!  to_username: "to username"       !
!  from_username: "from username"   !
!  timestamp : "time"               !
!  text : ""                        !
 -----------------------------------
*/
router.post ('/send-inbox-msg', (req,res,next)=> {

    schema.loginschema.findOne({username: req.body.to_username}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else {
        /*
         * We need to traverse through each of our friendlist to get the exact row of friendlist
         * table. Only username is not sufficient to get the same. Multiple rows with same Username
         * can exist in friendlist table.
         */
        for(let i=0;i<docs.friendlist.length;i++) {
           schema.friendlistschema.findOne({username: req.body.from_username, _id: docs.friendlist[i]._id}, function(err_inner, docs_inner) {
             if(err_inner) {
                // res.json(err_inner);
             }
             else {
              /*
               * Ideally this should be true only once. So res.json should not be called multiple times.
               * If it is getting called, then there must be something fishy with the DB entries.
               */
               if (docs_inner) {
                 let msg = new schema.inboxmessageschema({
                   timestamp: req.body.timestamp,
                   text: req.body.text
                 });

                 msg.save((err, item)=> {
                   if(err) {
                  //   res.json(err);
                   }
                   else {
                     docs_inner.inbox.push(item._id);
                     docs_inner.save((err, item_m)=>{
                       if(err) {
                    //     res.json(err);
                       }
                       else {
                            res.json({"msg": "Message sent."});
                       }
                     });
                   }
                 });
               }
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
router.post ('/get-inbox-msg', (req,res,next)=> {
    schema.friendlistschema.findOne({_id: ObjectId(req.body.id)}, function(err, docs) {
      if(err) {
        res.json(err);
      }
      else {
        if(docs  != undefined && docs.inbox.length > 0) {
            /*Get all messages form DB in one-shot*/
            schema.inboxmessageschema.find( {_id: {$in:docs.inbox} }, function (err, result) {
              if (err) {
                res.json(err);
              }
              else {
                res.json(result);
              }
            });
          }
          else {
            res.json(docs);
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
           /*Delete all messages once user read it in one shot*/
          schema.inboxmessageschema.deleteMany({_id: {$in:docs.inbox}}, function (err, result) {
            if (err) {
                res.json(err);
            }
            else {
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
          });
         }
      }
    });
});

module.exports = router;
