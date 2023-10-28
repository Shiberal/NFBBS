//use express
const express = require('express');
const fs = require('fs');
var bodyParser = require('body-parser')
const buckethandler = require('./libs/buckethandler');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const users = [
    { id: 1, username: 'test', password: 'test1' },
    { id: 2, username: 'user2', password: 'password2' },
  ];

passport.use(new BasicStrategy(
    (username, password, done) => {
    const user = users.find(u => u.username === username && u.password === password);
  
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }
  
      return done(null, user);
    }
  ));



var bhandler = buckethandler("buckets", passport);
const port = 3000;
const app = express();
app.use(bodyParser.json());
app.use(passport.initialize());
bhandler.initCommands(app)
bhandler.loadBuckets(app)


try {
    app.listen(port, () => {console.log(`Server is running on port ${port}`)});
} catch (error) {
    
}