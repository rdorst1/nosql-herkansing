const UserController = require('../controllers/user_controller');
const ThreadController = require('../controllers/thread_controller');
const CommentController = require('../controllers/comment_controller');
module.exports = (app) => {
    //Users
    app.post('/api/user', UserController.create )
    app.put('/api/user', UserController.update )
    app.delete('/api/user' , UserController.delete)  
    app.post('/api/user/friend', UserController.addFriendship)
    app.delete('/api/user/friend', UserController.deleteFriendship)
    //Threads
    app.post('/api/thread', ThreadController.create )
    app.get('/api/thread', ThreadController.getAll )
    app.get('/api/thread/:id', ThreadController.getOne )
    app.get('/api/sortbyupvotes/thread', ThreadController.sortByUpvotes)
    app.get('/api/sortbydifference/thread', ThreadController.sortByDifference)
    app.put('/api/thread/:id', ThreadController.update)
    app.post('/api/thread/upvote/:id', ThreadController.upvote)
    app.post('/api/thread/downvote/:id', ThreadController.downvote)
    app.delete('/api/thread/:id', ThreadController.delete)

    //Comments
    app.post('/api/comment/:id', CommentController.create)
    app.delete('/api/comment/:id', CommentController.delete)
    app.post('/api/comment/upvote/:id', CommentController.upvote)
    //app.post('/api/thread/:threadID/comment/:commentID', CommentController.createCommentOnComment);
    app.post('/api/comment/downvote/:id', CommentController.downvote)

    
};