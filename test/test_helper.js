const mongoose = require('mongoose');
const driver = require('../neo4j-driver');

mongoose.Promise = global.Promise;

before((done) => {
  mongoose.connect('mongodb://localhost/reddit_nosqldb_test', {useNewUrlParser: true});
  mongoose.connection
    .once('open', () => { done(); })
    .on('error', (error) => {
      console.warn('Warning', error);
    });
});

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

