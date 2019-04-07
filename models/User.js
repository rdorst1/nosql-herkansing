const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required.']
  },
  password: {
    type: String,
    required: [true, 'Password is required.']
  }
});

UserSchema.plugin(uniqueValidator);
const User = mongoose.model('user', UserSchema);

module.exports = User;