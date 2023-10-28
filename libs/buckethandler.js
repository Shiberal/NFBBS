const fs = require('fs');
const multer = require('multer');
const storage = multer.memoryStorage(); // This stores the uploaded file in memory as a Buffer
const upload = multer({ storage: storage });
const path = require('path');

var passport ;



// Initialize the bucket folder
let bucket_folder = '';

// Function to load all buckets and their snapshots
function loadBuckets(_app) {
    const buckets = fs.readdirSync(bucket_folder);

    for (let i = 0; i < buckets.length; i++) {
        const bucket = buckets[i];
        loadBucket(_app, bucket);

        const snapshotFolder = fs.readdirSync(`${bucket_folder}/${bucket}`);

        for (let j = 0; j < snapshotFolder.length; j++) {
            const snapshot = snapshotFolder[j];
            loadSnapshot(_app, bucket, snapshot);
        }
    }
}

// Function to load a specific bucket
function loadBucket(_app, bucket) {
    _app.get(`/${bucket}/newsnapshot`,passport.authenticate('basic', { session: false }), function (req, res) {
        const bucketName = req.url.split('/')[1];
        const snapshotName = `${bucketName}_${Date.now()}`;
        newSnapshot(_app, bucketName, snapshotName);


        res.send(snapshotName);
    });

    _app.get(`/${bucket}/list`,passport.authenticate('basic', { session: false }), function (req, res) {
        console.log(req.url);
        const files = fs.readdirSync(`${bucket_folder}/${bucket}`);
        res.send(files);
    });

    _app.get(`/${bucket}/deletebucket`,passport.authenticate('basic', { session: false }), function (req, res) {
        fs.rm(`${bucket_folder}/${bucket}`, { recursive: true, force: true }, (error) => {
            console.log(error);
        });
        res.send('deleted');
    });
}

// Function to load a specific snapshot
function loadSnapshot(_app, bucket, snapshot) {



    _app.post(`/${bucket}/${snapshot}/addFile`, upload.single('file'),passport.authenticate('basic', { session: false }), function (req, res) {
        console.log("called upload");
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        const fileData = req.file.buffer; // Access the file data as a Buffer
        const fileName = req.query.name; // Assuming you pass the file name as a query parameter
        
        if (!fileName) {
            return res.status(400).send('File name is missing');
        }

        // Sanitize the file name to prevent any malicious paths
        const sanitizedFileName = path.basename(fileName);
        sanitizedPath = path.dirname(removePathTraversal(fileName));
    
        console.log(sanitizedPath);
        var filePath = path.join(bucket_folder, bucket, snapshot,sanitizedPath)

        
        
       
        // make directory if not exists
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }

        filePath = path.join(filePath,sanitizedFileName);
        
        console.log(filePath);
        // Save the file data to the specified path

        

        fs.writeFile(filePath, fileData, (error) => {
            if (error) {
                console.error(error);
                res.status(500).send('Error while adding the file to the snapshot');
            } else {
                res.send('File added to the snapshot successfully');
            }
        });
    });
    


    _app.get(`/${bucket}/${snapshot}/getFile`, passport.authenticate('basic', { session: false }),function (req, res) {
        var fileName = req.query.name; // Assuming you pass the file name as a query parameter
        console.log("a:"+ fileName)
        
        pathName = path.dirname(removePathTraversal(fileName));
        fileName = path.basename(fileName);
        
        var filePath =  path.join(bucket_folder, bucket, snapshot, pathName,fileName);
        console.log("a:"+ fileName)
        

        // Check if the file exists
        if (fs.existsSync(filePath)) {
            // Read and send the file
            fs.readFile(filePath, (error, fileData) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Error while retrieving the file from the snapshot');
                } else {
                    res.send(fileData);
                }
            });
        } else {
            res.status(404).send('File not found in the snapshot');
        }
    });

    _app.get(`/${bucket}/${snapshot}/deleteFile`,passport.authenticate('basic', { session: false }), function (req, res) {
        console.log(_app.get);
        res.send(`${bucket_folder}${req.url}`);
    });

    _app.get(`/${bucket}/${snapshot}/deletesnapshot`,passport.authenticate('basic', { session: false }), function (req, res) {
        const list_of_snapshots = fs.readdirSync(`${bucket_folder}/${bucket}`);
        fs.rm(`${bucket_folder}/${bucket}/${snapshot}`, { recursive: true, force: true }, (error) => {
            console.log(error);
        });
        res.send('deleted');
    });

    _app.get(`/${bucket}/${snapshot}/list`,passport.authenticate('basic', { session: false }), function (req, res) {
        const files = fs.readdirSync(`${bucket_folder}/${bucket}/${snapshot}`);
        res.send(files);
    });

}

// Function to create a new bucket
function newBucket(_bucketName) {
    if (!fs.existsSync(bucket_folder)) {
        fs.mkdirSync(`${bucket_folder}/${_bucketName}`);}
}

// Function to create a new snapshot
function newSnapshot(_app, bucketName, snapshotName) {
    fs.mkdirSync(`${bucket_folder}/${bucketName}/${snapshotName}`);
    loadSnapshot(_app, bucketName, snapshotName);
}

// Function to initialize commands
function initCommands(_app) {
    _app.get('/list',passport.authenticate('basic', { session: false }), function (req, res) {
        const buckets = fs.readdirSync(bucket_folder);
        res.send(buckets);
    });

    _app.get('/newbucket',passport.authenticate('basic', { session: false }), function (req, res) {
        const new_bucket_name = req.query.name;
        newBucket(new_bucket_name);
        const buckets = fs.readdirSync(bucket_folder);
        loadBucket(_app, new_bucket_name);
        res.send(buckets);
    });
}

// Initialize the bucket handler
function Buckethandler(_folder, pass) {
    passport = pass;

    bucket_folder = `./${_folder}`;
    return buckets;
}

// Export functions
const buckets = {};
buckets.newbucket = newBucket;
buckets.loadBuckets = loadBuckets;
buckets.initCommands = initCommands;

module.exports = Buckethandler;



function removePathTraversal(filePath) {
    // Replace "../" with an empty string.
    let safePath = filePath.replace(/\.\.\//g, '');
  
    // Replace "/../" with an empty string.
    safePath = safePath.replace(/\/\.\.\//g, '');
  
    // Replace any leading "../" with an empty string.
    safePath = safePath.replace(/^\.\.\//g, '');
  
    return safePath;
  }