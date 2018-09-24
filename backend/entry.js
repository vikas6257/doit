// Import all required libraries
var express = require("express");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var cors = require("cors");

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
app.use(cors());
app.use(bodyparser.json());
app.use('/api',   route);

//Start back end server
app.listen(port, ()=>{
  console.log("Back end sever has been started at port 3000")
});
