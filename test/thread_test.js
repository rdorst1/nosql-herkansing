const assert = require('assert')
const Thread = require('../models/Thread')
const User = require('../models/User')
const request = require('supertest')
const app = require('../app')

describe('Create, Read, Update and Delete threads out of the database', () => {

    let currentThread;
    let currentUser
    beforeEach((done) => {
        user = new User({ name: 'threadTester', password: 'test123' })
        thread = new Thread({ name: 'threadTester', title: 'threadTitle', content: 'threadContent' })

        user.save().then((s) => 
            {
            currentUser = s;
            thread.save().then(() => {
                Thread.findOne({ title: 'threadTitle', content: 'threadContent' })
                    .then(threadPromise => {
                        currentThread = threadPromise;
                        done();
                    })
            })
        })
    });

    it('Post to /api/thread creates a new thread', (done) => {
        request(app)
            .post('/api/thread')
            .send({ name: 'threadTester', title: 'testTitle', content: 'testContent' })
            .end((err,res) => {
                Thread.findOne(({ title: 'testTitle', content: 'testContent' }))
                    .then(thread => {
                        assert(thread.author.name == 'threadTester')
                        assert(thread.title == 'testTitle')
                        assert(thread.content == 'testContent')
                        assert(res.status == 200)
                        done();
                    })
                    .catch()
            })
    })

    it('Post to /api/thread fails, invalid user', (done) => {
        request(app)
            .post('/api/thread')
            .send({ name: 'hackerMan06', title: 'testTitle', content: 'testContent' })
            .end(function (err, res) {
                assert(res.status == 422)
                done();
            })
    })

    it('Put to /api/thread updates the content of the thread', (done) => {
        currentThreadId = currentThread._id;

        request(app)
            .put(`/api/thread/${currentThreadId}`)
            .send({ name: 'threadTester', content: 'updatedContent' })
            .end(function (err, res) {
                Thread.findById({_id : currentThread._id})
                .then((r) => {                    
                    assert(res.status == 200)
                    assert(r.content == 'updatedContent')
                    done();
                })         
            
            });
    });

    it('Delete to /api/thread deletes the thread', (done) => {
        currentThreadId = currentThread._id;

        request(app)
            .delete(`/api/thread/${currentThreadId}`)
            .end(function (err, res) {
                Thread.findById({_id : currentThread._id})
                .then((r) => {
                    
                    assert(r == null)
                    assert(res.status == 200)
                    assert(res.body.message == 'Thread succesfully deleted')
                    done();
                })
            
            })
    })

    it('Delete to /api/thread fails, wrong id', (done) => {
        wrongid = '5bfda6527854b85834a07015'

        request(app)
            .delete(`/api/thread/${wrongid}`)
            .end(function (err, res) {
                assert(res.status == 422)
                assert(res.body.error == 'Thread not found, use a valid thread ID')
                done()
            })
    })

    it('Get to /api/thread/:id returns specific thread', (done) => {
        currentThreadId = currentThread._id

        request(app)
            .get(`/api/thread/${currentThreadId}`)
            .end(function (err, res) {
                Thread.findById({_id : currentThread._id})
                .then((r) => {
                    assert(currentThread._id== res.body[0]._id)
                    done();
                })
            
            })
    })

    it('Can upvote thread', (done) => {
        request(app)
        .post(`/api/thread/upvote/${currentThread._id}`)
        .send({ name: "threadTester"})
        .end(function(err,res) {
            Thread.findById({_id: currentThread._id})
            .then((r) => {          
                assert(r.upVotes.length == 1)
                assert(res.status == 200)
                assert(r.upVotes[0].toString() == currentUser._id.toString() )
                done();
            })
        })
    })

    it('Cannot upvote a thread twice' , (done) => {
        request(app)
        .post(`/api/thread/upvote/${currentThread._id}`)
        .send({ name: "threadTester"})
        .end(function(err,res) {
            request(app)
            .post(`/api/thread/upvote/${currentThread._id}`)
            .send({ name: "threadTester"})
            .end(function(err,res) {               
                assert(res.body.error == 'Already upvoted this thread')
                assert(res.status == 422)
                done();
            })
        })
    })

    it('Can upvote a thread while downvoted and removes downvote' , (done) => {
        request(app)
        .post(`/api/thread/downvote/${currentThread._id}`)
        .send({ name: "threadTester"})
        .end(function(err,res) {
            request(app)
            .post(`/api/thread/upvote/${currentThread._id}`)
            .send({ name: "threadTester"})
            .end(function(err,res) {
                Thread.findById({_id : currentThread._id})
                .then((t) => {
                    assert(t.downVotes.length == 0)
                    assert(t.upVotes.length == 1)
                    assert(res.status == 200)
                    done();
                })               
            })
        })
    })


    it('Can downvote thread', (done) => {
        request(app)
        .post(`/api/thread/downvote/${currentThread._id}`)
        .send({ name: "threadTester"})
        .end(function(err,res) {
            Thread.findById({_id: currentThread._id})
            .then((r) => {          
                assert(r.downVotes.length == 1)
                assert(res.status == 200)
                assert(r.downVotes[0].toString() == currentUser._id.toString() )
                done();
            })
        })
    })

    it('Cannot downvote a thread twice' , (done) => {
        request(app)
        .post(`/api/thread/downvote/${currentThread._id}`)
        .send({ name: "threadTester"})
        .end(function(err,res) {
            request(app)
            .post(`/api/thread/downvote/${currentThread._id}`)
            .send({ name: "threadTester"})
            .end(function(err,res) {               
                assert(res.body.error == 'Already downvoted this thread')
                assert(res.status == 422)
                done();
            })
        })
    })

    it('Can downvote a thread while upvoted and removes upvote' , (done) => {
        request(app)
        .post(`/api/thread/upvote/${currentThread._id}`)
        .send({ name: "threadTester"})
        .end(function(err,res) {
            request(app)
            .post(`/api/thread/downvote/${currentThread._id}`)
            .send({ name: "threadTester"})
            .end(function(err,res) {
                Thread.findById({_id : currentThread._id})
                .then((t) => {
                    assert(t.downVotes.length == 1)
                    assert(t.upVotes.length == 0)
                    assert(res.status == 200)
                    done();
                })               
            })
        })
    })
});