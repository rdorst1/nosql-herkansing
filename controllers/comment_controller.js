const Thread = require('../models/Thread');
const User = require('../models/User')
const Comment = require('../models/Comment')

module.exports = {
    create(req,res,next){
        const id = req.params.id;
        const commentProps = req.body;

        User.findOne({name: commentProps.name})
        .then((user) => {
            if(user == null){ 
                return next({message: "User not found, make sure to use correct user name"});
            }else {  
                Thread.findOne({_id: id})
                .then((thread) => {
                    if(thread == null) return next ({message : "Thread not found"})
                    else{                       
                        thread.comments.push({content: req.body.content, author: user._id})
                        thread.save();
                        res.send(thread)
                    }
                }).catch(next)
            }
        }).catch(next)
    },


    delete(req,res,next){
        const id = req.params.id;

        Thread.findOne({comments : { $elemMatch: { _id : id} }})
        .then((thread) => {
            
            if(thread == null) return next({message : "This comment was not found for this thread"})
            
            Thread.updateOne({},
                { $pull: {comments :  { _id: id}}}, {multi:true}).then((thread) => {
                
                });

                thread.save()
                .then(() => Thread.findById({_id : thread._id}))
                .then(thread => res.send({message : "comment succesfully deleted"}))
                .catch(next)
            
      
        }).catch(next)
    },
    // //Not working properly
    // createCommentOnComment(req,res,next){
    //     const threadID = req.params.threadID;
    //     const commentID = req.params.commentID;

    //     User.findOne({name: req.body.name}).then((user) => {
            
    //         Thread.findOne({comments : { $elemMatch: { _id : id} }})
    //         .then((thread) => {
    //                 for(var i = 0; i<thread.comments.length; i++){
    //                     if(thread.comments[i]._id == commentID){
    //                         thread.comments[i].comments.push({content : req.body.content, author :user._id})
    //                     }
    //                 }                    
    //                 thread.save()
    //                 .then(() => Thread.findById({_id : thread._id}))
    //                 .then(thread => res.send(thread))
    //                 .catch(next)
    //         }).catch(next)
    //     }).catch(next)
    // },
    upvote(req,res,next){
        const commentID = req.params.id;
        const user = req.body.name;
   

        User.findOne({name: user})
        .then((user) => {
            if(user == null) return next({message: "user not found"})
            else {
                Thread.findOne({comments: { $elemMatch : { _id : commentID}}})
                .then((thread) => {
                    var indexOfComment;
                    var found;
                    if(thread == null) return next({message : "No comments found for the given ID"})
                    if(thread.comments.length == 0){
                        return next({message : "Comment not found"})               
                    }
                    for(var i = 0; i < thread.comments.length; i++){
                            if(thread.comments[i]._id == commentID){
                                indexOfComment = i;
                                found = true
                            }
                    }
                    if(!found) return next({message : "Comment not found"})        
                    for(var i = 0; i < thread.comments[indexOfComment].upVotes.length; i++){
                        if( thread.comments[indexOfComment].upVotes[i].toString() == user._id.toString()){
                            return next({message : "Already upvoted"})
                        }
                    }
                    for(var i = 0; i< thread.comments[indexOfComment].downVotes.length; i++){
                        if( thread.comments[indexOfComment].downVotes[i].toString() == user._id.toString()){
                            thread.comments[indexOfComment].downVotes.remove(user._id);
                        }
                    }
                    thread.comments[indexOfComment].upVotes.push(user._id);
                    thread.save()
                    .then((thread) => res.send(thread))
                    .catch(next)

                }).catch(next)
            }
        }).catch(next)
    },
    downvote(req,res,next){
        const commentID = req.params.id;
        const user = req.body.name;
     

        User.findOne({name: user})
        .then((user) => {
            if(user == null) return next({message: "user not found"})
            else {
                Thread.findOne({comments: { $elemMatch : { _id : commentID}}})
                .then((thread) => {
                    var indexOfComment;
                    var found = false;
                    
                    if(thread == null) return next({message : "No comments found for the given ID"})
                    if(thread.comments.length == 0){
                        return next({message : "Comment not found"})               
                    }
                    
                    for(var i = 0; i < thread.comments.length; i++){
                            if(thread.comments[i]._id == commentID){
                                indexOfComment = i;
                                found = true
                            }
                    }
                    if(!found) return next({message : "Comment not found"})
                
           
                    for(var i = 0; i < thread.comments[indexOfComment].downVotes.length; i++){
                        if( thread.comments[indexOfComment].downVotes[i].toString() == user._id.toString()){
                            return next({message : "Already downVoted"})
                        }
                    }
                    for(var i = 0; i< thread.comments[indexOfComment].upVotes.length; i++){
                        if( thread.comments[indexOfComment].upVotes[i].toString() == user._id.toString()){
                            thread.comments[indexOfComment].upVotes.remove(user._id);
                        }
                    }
                    thread.comments[indexOfComment].downVotes.push(user._id);
                    thread.save()
                    .then((thread) => res.send(thread))
                    .catch(next)

                }).catch(next)
            }
        }).catch(next)
    }
    
      
}