var express = require("express");
var router = express.Router();
var cors = require("cors");

const user_login = require("../model/login");


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
        res.json({msg: "Succesfully logged in", status: "true"});
      }
      else {
         res.json({msg: "User does not not exist", status: "false"});
      }
    });
});

module.exports = router;
