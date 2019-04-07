const User = require('../models/User');
const Thread = require('../models/Thread');
const Comment = require('../models/Comment')
module.exports = {
    create(req,res,next){
        const threadProps = req.body;
        User.findOne({name: threadProps.name})
        .then((user) => {
            if(user == null){
                return next({message: "User not found, make sure to use correct user name"});
            }else {
                threadProps.author=user._id;
                Thread.create(threadProps)
                 .then(thread => res.send(thread))
                 .catch(next);
            }
        })    

    },
    getAll(req,res,next){
        Thread.find({}, { comments: 0, id : 0})
        .then(threads => 
        {
            
            res.send(threads)
        })
        .catch(next);
    },
    getOne(req,res,next){
        const threadID = req.params.id;
        Thread.find({_id: threadID})
        .then(thread => {
            
            
            res.send(thread)
        })
        .catch(next);
    },
    update(req,res,next){
        const threadProps = req.body;
        const threadID = req.params.id;

        
        if(threadProps.title != undefined){
           return  next({message : "Cannot change title, make sure you dont post a new title"});
        }
        User.findOne({name: threadProps.name})
        .then((user) => {
            if(user == null){
      
                return next({message: "User not found, make sure to use correct user name"});
            }else {          
                threadProps.author=user._id;
                Thread.findByIdAndUpdate({_id: threadID}, threadProps)
                 .then((thread) =>  {
                     
                     if(thread == null) return next({message : "Thread not found"})
                     else {
                        Thread.findById({_id : threadID})
                        .then(newThread => res.send(newThread))
                        .catch(next);
                     }
            }).catch(next);
         }
        })   
    },
    upvote(req,res,next){
        const name = req.body.name;
        const threadID = req.params.id;
        User.findOne({name: name})
        .then((user) => {
            if(user == null){
                return next({message: "User not found, make sure to use correct user name"});
            }else {
                Thread.findById({_id: threadID})
                .then((thread) => {
                    for(var i = 0; i < thread.upVotes.length; i++){
                        if(thread.upVotes[i].toString() == user._id.toString()){
                            return next ({message: "Already upvoted this thread"})
                        }
                    }           
                    for(var i = 0; i < thread.downVotes.length; i++){
                        if(thread.downVotes[i].toString() == user._id.toString()){
                            thread.downVotes.remove(user._id)
                        }
                    } 
                    thread.upVotes.push(user._id);
                    thread.save()
                        .then(Thread.findById({_id: thread._id}))
                        .then((thread) => {
                            res.send(thread)
                        }).catch(next)
                }).catch(next)
            }
        }).catch(next)    
    },
    downvote(req,res,next){
        const name = req.body.name;
        const threadID = req.params.id;

        User.findOne({name: name})
        .then((user) => {

            if(user == null){
                return next({message: "User not found, make sure to use correct user name"});
            }else {
                Thread.findById({_id: threadID})
                .then((thread) => {
                    for(var i = 0; i < thread.downVotes.length; i++){
                        if(thread.downVotes[i].toString() == user._id.toString()){
                            return next ({message: "Already downvoted this thread"})
                        }
                    }
                    
                    for(var i = 0; i < thread.upVotes.length; i++){
                        if(thread.upVotes[i].toString() == user._id.toString()){
                            thread.upVotes.remove(user._id)
                        }
                    }   
    
                    thread.downVotes.push(user._id);
                    thread.save()
                        .then(Thread.findById({_id: thread._id}))
                        .then((thread) =>  {                   
                            res.send(thread)})
                        .catch(next)
                }).catch(next)
            }
        }).catch(next)
    },
    delete(req,res,next){
        const threadID = req.params.id;
        Thread.findOneAndDelete({_id: threadID})
        .then((thread) => {
            if(thread == null) {
                next({message : "Thread not found, use a valid thread ID"});

            }else {
                res.status(200).send({message : "Thread succesfully deleted"});
            }
        })
    },
    sortByUpvotes(req,res,next){
        Thread.find({}, {comments : 0, id : 0}).sort({"upVotes" : -1})
        .then((result) => {

            res.send(result)
        }).catch(next);
    },
    sortByDifference(req,res,next){
        Thread.aggregate(
            [
                { "$project" : {
                    "_id" : 1,
                    "author" : 1,
                    "title" : 1,
                    "content" : 1,
                    "amountOfUpVotes" : {"$size" : "$upVotes"},
                    "amountOfDownVotes" : {"$size" : "$downVotes"},
                    "difference" : { $subtract : [{ $size : "$upVotes"}, {$size :"$downVotes"}] }
                }},
                { "$sort" : {"difference" : -1}} 
            ]
        ).then((result) => {
            Thread.populate(result, { path : 'author', select : 'name'})
            .then((r) => {
                res.send(r);
            })
            .catch(next);
        }).catch(next)
    }
}