//use express
const express = require('express');
const fs = require('fs');
var bodyParser = require('body-parser')
const buckethandler = require('./libs/buckethandler');

var bhandler = buckethandler("buckets");


const port = 3000;
const app = express();
app.use(bodyParser.json());
bhandler.initCommands(app)
bhandler.loadBuckets(app)









app.listen(port, () => {console.log(`Server is running on port ${port}`)});