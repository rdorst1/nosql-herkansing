const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = require('./Comment');


const ThreadSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required.']
  },
  content: {
    type: String,
    required: [true, 'Content is required.']
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
  comments: [
    CommentSchema
  ]
},
{
  toJSON: {
  virtuals: true 
  }
});

ThreadSchema.virtual('downVotesCount').get(function(next){
  return this.downVotes.length;
})
ThreadSchema.virtual('upVotesCount').get(function(next){
  return this.upVotes.length;
})

ThreadSchema.plugin(require('mongoose-autopopulate'));

const Thread = mongoose.model('thread', ThreadSchema);


module.exports = Thread;