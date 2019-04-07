const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentsSchema = require('./Comment');

const CommentSchema = new Schema({
  content: {
    type: String,
    required: [true, 'content is required.']
  },
  upVotes: [{
    type: Schema.Types.ObjectId,
    ref: 'user'
  }],
  downVotes: [{
    type: Schema.Types.ObjectId,
    ref: 'user'
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    autopopulate : { select : 'name'}
  },
  comments:[CommentsSchema],
});

CommentSchema.plugin(require('mongoose-autopopulate'));

module.exports = CommentSchema;