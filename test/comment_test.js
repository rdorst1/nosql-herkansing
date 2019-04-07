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
        thread.comments.push({ name: 'threadTester', content: 'test content' })

        user.save().then((s) => {
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


    it('Can create a new comment to a thread /api/comment/threadid', (done) => {

        request(app)
            .post(`/api/comment/${currentThread._id}`)
            .send({ name: 'threadTester', content: 'fromPost' })
            .end((err, res) => {
                Thread.findOne(({ _id: currentThread._id }))
                    .then(thread => {
                        assert(res.status == 200)
                        assert(thread.comments[1].content == 'fromPost')
                        done();
                    })
                    .catch()
            })
    })


    it('Can can not create a new comment with a user that does not exist', (done) => {
        request(app)
            .post(`/api/comment/${currentThread._id}`)
            .send({ name: 'wrong', content: 'fromPost' })
            .end((err, res) => {
                assert(res.status == 422)
                assert(res.body.error == 'User not found, make sure to use correct user name')
                done();
            })
    })

    it('Can delete a comment based on comment id', (done) => {
        currentThreadId = currentThread._id;
        currentCommentId = thread.comments[0]._id;

        request(app)
            .delete(`/api/comment/${currentCommentId}`)
            .end(function (err, res) {
                Thread.findById({ _id: currentThreadId })
                    .then((t) => {
                        assert(res.status == 200)
                        assert(t.comments.length == 0)
                        done();
                    })
            })
    })

    it('Can not delete comment based on comment id that does not exist', (done) => {
        incorrectCommentId = '9bfff791f6b5d034748cc3da';

        request(app)
            .delete((`/api/comment/${incorrectCommentId}`))
            .end(function (err, res) {
                assert(res.status == 422)
                assert(res.body.error == 'This comment was not found for this thread')
                done();
            })
    })
    it('Can upvote a comment based on comment id', (done) => {
        request(app)
            .post(`/api/comment/upvote/${currentThread.comments[0]._id}`)
            .send({ name: 'threadTester' })
            .end((err, res) => {
                Thread.findById({ _id: currentThread._id })
                    .then((r) => {
                        assert(r.comments[0].upVotes.length == 1);
                        assert(res.status == 200)
                        done();
                    })
            })
    })

    it('Can not upvote a comment based on non existing comment id', (done) => {
        request(app)
            .post(`/api/comment/upvote/6cfff2748f5c682d20d9635d`)
            .send({ name: 'threadTester' })
            .end((err, res) => {
                
                assert(res.body.error == 'No comments found for the given ID')
                assert(res.status == 422)
                done();
            })
    })

    it('Can not upvote a comment twice', (done) => {
        request(app)
            .post(`/api/comment/upvote/${currentThread.comments[0]._id}`)
            .send({ name: 'threadTester' })
            .end((err, res) => {
                request(app)
                    .post(`/api/comment/upvote/${currentThread.comments[0]._id}`)
                    .send({ name: 'threadTester' })
                    .end((err, res) => {

                        assert(res.body.error == 'Already upvoted')
                        assert(res.status == 422)
                        done();
                    })
            })
    })

    it('Can upvote while downvoted and removes the downvote', (done) => {
        request(app)
            .post(`/api/comment/downvote/${currentThread.comments[0]._id}`)
            .send({ name: 'threadTester' })
            .end((err, res) => {
                request(app)
                    .post(`/api/comment/upvote/${currentThread.comments[0]._id}`)
                    .send({ name: 'threadTester' })
                    .end((err, res) => {

                        Thread.findById({ _id: currentThread._id })
                            .then((t) => {
                                assert(t.comments[0].downVotes.length == 0)
                                assert(t.comments[0].upVotes.length == 1)
                                assert(res.status == 200)
                                done();
                            })
                    })
            })
    })
    it('Can downvote a comment based on comment id', (done) => {
        currentThreadId = currentThread._id;
        currentCommentId = thread.comments[0]._id;

        request(app)
            .post(`/api/comment/downvote/${currentCommentId}`)
            .send({ name: "threadTester" })
            .end(function (err, res) {
                Thread.findById(currentThreadId)
                    .then((t) => {
                        assert(t.comments[0].downVotes.length == 1)
                        assert(res.status == 200)
                        done();
                    })
            })
    })

    it('Can not downvote a comment based on non existing comment id', (done) => {
        currentThreadId = currentThread._id;
        currentCommentId = thread.comments[0]._id;

        request(app)
            .post(`/api/comment/downvote/6cfff2748f5c682d20d9635d`)
            .send({ name: 'threadTester' })
            .end((err, res) => {
                assert(res.body.error == 'No comments found for the given ID')
                assert(res.status == 422)
                done();
            })
    })

it('Can downvote while upvoted and removes the upvote', (done) => {
    request(app)
        .post(`/api/comment/upvote/${currentThread.comments[0]._id}`)
        .send({ name: 'threadTester' })
        .end((err, res) => {
            request(app)
                .post(`/api/comment/downvote/${currentThread.comments[0]._id}`)
                .send({ name: 'threadTester' })
                .end((err, res) => {

                    Thread.findById({ _id: currentThread._id })
                        .then((t) => {
                            assert(t.comments[0].downVotes.length == 1)
                            assert(t.comments[0].upVotes.length == 0)
                            assert(res.status == 200)
                            done();
                        })
                })
        })
})

    it('Can not downvote a comment twice', (done) => {
        request(app)
            .post(`/api/comment/downvote/${currentThread.comments[0]._id}`)
            .send({ name: 'threadTester' })
            .end((err, res) => {
                request(app)
                    .post(`/api/comment/downvote/${currentThread.comments[0]._id}`)
                    .send({ name: 'threadTester' })
                    .end((err, res) => {
                        assert(res.body.error == 'Already downVoted')
                        assert(res.status == 422)
                        done();
                    })
            })
    })
})

