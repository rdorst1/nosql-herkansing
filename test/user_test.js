const assert = require('assert');
const User = require('../models/User');
const request = require('supertest');
const app = require('../app');
const driver = require('../neo4j-driver');
const mongoose = require('mongoose');


describe('Create, Update and Delete users out of the database', () => {

  beforeEach((done) => {
    mongoose.connection.collections.users.drop(() => {
      mongoose.connection.collections.threads.drop(() => {
        let session = driver.session();
        session.run(
          `MATCH (x)
          DETACH DELETE x`
        ).then(() => {
          session.close();
          done();
        })
      })
    })
  });

  it('Post to /api/user creates a new user', (done) => {

    const testName = 'MrTest'
    const testPassword = 'test123'
    request(app)
      .post('/api/user')
      .send({ name: testName, password: testPassword })
      .end(() => {
        User.findOne(({ name: testName, password: testPassword }))
          .then((mUser) => {

            let session = driver.session();
            session.run(
              `MATCH (x:User)
                WHERE x.name = $name
                return x`,
              { name: testName }
            ).then((nUser) => {
              if (nUser.records.length == 0) { assert() }
              const rec = nUser.records[0]
              const node = rec.get(0);
              session.close();
              assert(testName === node.properties.name);
              assert(testName === mUser.name)
              assert(testPassword === mUser.password);
              done();
            }).catch()

          }).catch()
      });
  });

  it('Post to /api/user fails, duplicate user', (done) => {
    const testUser = new User({ name: 'MrTest', password: 'test123' })

    testUser.save().then(() => {
      request(app)
        .post('/api/user')
        .send({ name: 'MrTest', password: 'test123' })
        .end(function (err, res) {
          assert(res.status === 422)
          assert(res.body.error === 'User already exists')
          done();
        })
    })
  });

  it('Put to /api/user updates a user', (done) => {
    const testUser = new User({ name: 'MrTest', password: 'test123' })

    testUser.save().then(() => {
      request(app)
        .put('/api/user')
        .send({ name: 'MrTest', password: 'test123', newpassword: 'newTest123' })
        .end((err, res) => {
          User.findOne(({ name: 'MrTest', password: 'newTest123' }))
            .then(testUser => {
              assert(testUser.name == 'MrTest')
              assert(testUser.password == 'newTest123')
              assert(res.status === 200)
              done();
            });
        });
    });
  });

  it('Put to /api/user update fails, wrong username or password', (done) => {
    const testUser = new User({ name: 'MrTest', password: 'test123' })

    testUser.save().then(() => {
      request(app)
        .put('/api/user')
        .send({ name: 'MrTest', password: 'testFail', newpassword: 'newTest123' })
        .end(function (err, res) {
          assert(res.status == 422)
          done();
        });
    });
  });

  it('Delete to /api/user deletes a user', (done) => {
    const testUser = new User({ name: 'MrTest', password: 'test123' })


    testUser.save().then(() => {
      request(app)
        .delete('/api/user')
        .send({ name: 'MrTest', password: 'test123' })
        .end(function (err, res) {
          User.findOne({ name: 'MrTest', password: 'test123' })
            .then(testUser => {
              assert(res.status == 200)
              assert(testUser == null)
              done();
            });
        });
    });

  });

  it('Delete to /api/user delete fails wrong username or password', (done) => {
    const testUser = new User({ name: 'MrTest2', password: 'test1234' })

    testUser.save().then(() => {
      request(app)
        .delete('/api/user')
        .send({ name: 'MrTest', password: 'testFail' })
        .end(function (err, res) {
          assert(res.status == 422)
          done();
        });
    });

  });

  it('Adds a friendship between users', (done) => {

    request(app)
      .post('/api/user')
      .send({ name: "useruno", password: "uno" })
      .end((err, response) => {
        request(app)
          .post('/api/user')
          .send({ name: "userdos", password: "userdos" })
          .end((err, response) => {
            request(app)
              .post('/api/user/friend')
              .send({ name: "useruno", friend: "userdos" })
              .end((err, response) => {

                assert(response.body.message === "Succesfully added friendship")
                assert(response.status == 200)
                done();
              })
          });
      });
  })

  it('Cant add a new friendship if users dont exist', (done) => {
    request(app)
      .post('/api/user/friend')
      .send({ name: "useruno", friend: "userdos" })
      .end((err, response) => {

        assert(response.body.error === "Users not found")
        assert(response.status == 422)
        done();
      })
  });

  it('Cant add a new friendship if only one user exists', (done) => {
    request(app)
      .post('/api/user')
      .send({ name: "userdos", password: "userdos" })
      .end((err, response) => {
        request(app)
          .post('/api/user/friend')
          .send({ name: "useruno", friend: "userdos" })
          .end((err, response) => {

            assert(response.body.error === "Users not found")
            assert(response.status == 422)
            done();
          })
      });
  });

  it('Delete to /api/user/friend a friendship', (done) => {
    request(app)
      .post('/api/user')
      .send({ name: "usert", password: "tres" })
      .end((err, response) => {
        request(app)
          .post('/api/user')
          .send({ name: "userq", password: "quadro" })
          .end((err, response) => {
            
            request(app)
              .post('/api/user/friend')
              .send({ name: "usert", friend: "userq" })
              .end((err, response) => {       
                 
                request(app)
                  .delete('/api/user/friend')
                  .send({ name: "usert", friend: "userq" })
                  .end((err, response) => {        
                  
                    assert(response.body.Message === "Friendship removed")
                    assert(response.status == 200)
                    done();
                  })
              })
          });
      });
  });
});