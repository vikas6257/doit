const mongoose = require("mongoose");

/*Schema for inbox-messages.*/
const inboxmessageschema = mongoose.Schema({
  timestamp: {
    type: String,
    require: true
  },
  text : {
    type: String,
    require: false
  }
});

/*Schema for friendlist.*/
const friendlistschema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: false
  },
  inbox: []
});


/*Root Schema for user*/
const loginschema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    required: false
  },
  friendlist : []
});

const ls = module.exports.loginschema = mongoose.model('ls', loginschema);
const fls = module.exports.friendlistschema = mongoose.model('fls', friendlistschema);
const ims = module.exports.inboxmessageschema = mongoose.model('ims', inboxmessageschema);
