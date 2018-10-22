const mongoose = require("mongoose");

const loginschema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  }
});

const user_login = module.exports = mongoose.model('user_login', loginschema);
