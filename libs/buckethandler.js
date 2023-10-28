const fs = require('fs');

var bucket_folder = "";

function loadBuckets(_app) {
    var buckets = fs.readdirSync(bucket_folder);
    for (var i = 0; i < buckets.length; i++) {

        loadBucket(_app, buckets[i]);


        var snapshot = fs.readdirSync(bucket_folder+"\\" + buckets[i]);
        for (var j = 0; j < snapshot.length; j++) {
            loadSnapshot(_app, buckets[i], snapshot[j]);
        }
    }
}

function loadBucket(_app, bucket) {

    _app.get("/" + bucket + "/" + "newsnapshot", function (req, res) {
        //get bucketname from req.url
        bucket_name = req.url.split("/")[1];
        snapshot_name = bucket_name + "_" + Date.now();

        newSnapshot(_app,bucket_name, snapshot_name);
        list_of_snapshots = fs.readdirSync(bucket_folder+"\\"+bucket_name);
        loadSnapshot(_app, bucket_name, );
        res.send(list_of_snapshots);
        
    });

    _app.get("/" + bucket + "/" + "delete", function (req, res) {
        console.log(req.url);
        res.send(bucket_folder + req.url);
    });
}


function loadSnapshot(_app, bucket, snapshot) {
    _app.get("/" + bucket + "/" + snapshot + "/addFile", function (req, res) {
        console.log(req.url);
        res.send(bucket_folder + req.url);
    });
    _app.get("/" + bucket + "/" + snapshot + "/deleteFile", function (req, res) {
        console.log(_app.get)
        res.send(bucket_folder + req.url);
    });
    _app.get("/" + bucket + "/" + snapshot + "/deleteSnapshot", function (req, res) {
        //delete snapshot folder and all its content
        fs.rmdirSync(bucket_folder+"\\"+bucket+"\\"+snapshot, { recursive: true });
    });
    _app.get("/" + bucket + "/" + snapshot + "/list", function (req, res) {
        //get list of files in snapshot
        files = fs.readdirSync(bucket_folder+"\\"+bucket+"\\"+snapshot);
        res.send(files);
    });
}

function newBucket(_bucketName) {
    fs.mkdirSync(bucket_folder+"\\"+_bucketName);
}

function newSnapshot(_app, bucket_name, snapshot_name) {
    fs.mkdirSync(bucket_folder + "\\" + bucket_name + "\\" + snapshot_name);
    loadSnapshot(_app, bucket_name, snapshot_name);
}

function deleteBucket(_bucketName) {
    console.log("deleteBucket called");
}

function addToBucket(_bucketName, _fileName) {
    console.log("addToBucket called");
}

function listBuckets() {
    console.log("listBuckets called");
}

function initCommands(_app) {
    _app.get("/list", function(req, res) {
        var buckets = fs.readdirSync(bucket_folder);
        res.send(buckets);
    })

    _app.get("/newbucket", function(req, res) {
        new_bucket_name = req.query.name;
        newBucket(new_bucket_name);
        var buckets = fs.readdirSync(bucket_folder);
        loadBucket(_app, new_bucket_name);
        res.send(buckets);
    })

}



function Buckethandler(_folder){
    //init bucket_folder
    bucket_folder = "./"+_folder;
    return buckets
}

var buckets = {};
buckets.newbucket = newBucket;
buckets.deleteBucket = deleteBucket;
buckets.addToBucket = addToBucket;
buckets.listBuckets = listBuckets;
buckets.loadBuckets = loadBuckets;
buckets.initCommands = initCommands;



//export functions
module.exports = Buckethandler;