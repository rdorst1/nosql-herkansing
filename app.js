const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const bodyParser = require('body-parser');
const User = require('./models/User');
const app = express();

mongoose.Promise = global.Promise;

// if (process.env.NODE_ENV === 'production') {
//     mongoose.connect('mongodb+srv://admin:1234@cluster0-3auhd.mongodb.net/test?retryWrites=true', {useNewUrlParser: true} );
//     mongoose.connection.on('connected', function () {  
//         console.log('Mongoose connected to test production database in cloud');
//     }); 
// }
// else if ( process.env.NODE_ENV === 'testCloud' ) {
//     mongoose.connect('mongodb+srv://admin:1234@cluster0-3auhd.mongodb.net/test?retryWrites=true', {useNewUrlParser: true} );
//     mongoose.connection.on('connected', function () {  
//         console.log('Mongoose connected to test cloud database');
//     }); 

// }else{
//     mongoose.connect('mongodb://localhost/db_local_reddit',  {useNewUrlParser: true} );
//     mongoose.connection.on('connected', function () {  
//         console.log('Mongoose connected to test database local ');
//     }); 
// }



const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:1234@cluster0-3auhd.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  console.log("Connected to mongoDb on Atlas")
  client.close();
});


mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
app.use(bodyParser.json());
routes(app);

app.use((err, req, res, next) => {
    res.status(422).send({ error: err.message });
  });

module.exports = app;
