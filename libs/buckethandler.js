var maxSize = 100 * 10.240;

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: maxSize } });
const path = require('path');
const crypto = require('crypto');
const fs = require('graceful-fs');
var passport;


function cloneDirectoryStructure(sourceDir, targetDir) {
    const items = fs.readdirSync(sourceDir);
  
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);
      const isDirectory = fs.statSync(sourcePath).isDirectory();
  
      if (isDirectory) {
        fs.mkdirSync(targetPath, { recursive: true }); // Create the directory in the target path
        cloneDirectoryStructure(sourcePath, targetPath); // Recurse into subdirectory
      }
    }
  }


  function createSymlinksToFiles(sourceDir, targetDir) {
    const items = fs.readdirSync(sourceDir);
  
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);
      const isDirectory = fs.statSync(sourcePath).isDirectory();
  
      if (!isDirectory) {
        const relativePath = path.relative(targetDir, sourcePath);
        fs.symlinkSync(relativePath, targetPath, 'file'); // Create a symbolic link for files
      } else {
        const subTargetDir = path.join(targetDir, item);
        fs.mkdirSync(subTargetDir, { recursive: true }); // Create the subdirectory
        createSymlinksToFiles(sourcePath, subTargetDir); // Recurse into subdirectory
      }
    }
  }


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
    _app.get(`/${bucket}/newsnapshot`, passport.authenticate('basic', { session: false }), function (req, res) {
        //console.log(req.url);

        const bucketName = req.url.split('/')[1];
        const snapshotName = `${bucketName}_${Date.now()}`;

        //get last snapshot
        const snapshotFolder = fs.readdirSync(`${bucket_folder}/${bucket}`);
        const oldsnapshot = snapshotFolder[snapshotFolder.length - 1];
        const oldsnapshotPath = `${bucket_folder}/${bucket}/${oldsnapshot}`;
        console.log(oldsnapshot);

        //create new snapshot root directory
        newSnapshot(_app,bucket,snapshotName)
        const newsnapshotPath = `${bucket_folder}/${bucket}/${snapshotName}`;

        
        cloneDirectoryStructure(oldsnapshotPath, newsnapshotPath);
        createSymlinksToFiles(oldsnapshotPath,newsnapshotPath);

        


        

        loadSnapshot(_app,bucket,snapshotName)
        res.send(snapshotName);

    });
    
    _app.get(`/${bucket}/list`, passport.authenticate('basic', { session: false }), function (req, res) {
        
        const files = fs.readdirSync(`${bucket_folder}/${bucket}`);
        //get date of creation
        for (let i = 0; i < files.length; i++) {
            files[i] = { name: files[i], date: fs.statSync(`${bucket_folder}/${bucket}/${files[i]}`).birthtime };
        }
        res.send(files);
    });

    _app.get(`/${bucket}/deletebucket`, passport.authenticate('basic', { session: false }), function (req, res) {
        fs.rm(`${bucket_folder}/${bucket}`, { recursive: true, force: true }, (error) => {
            console.log(error);
        });
        res.send('deleted');
    });
}

// Function to load a specific snapshot
function loadSnapshot(_app, bucket, snapshot) {



    _app.post(`/${bucket}/${snapshot}/addFile`, upload.single('file'), passport.authenticate('basic', { session: false }), function (req, res) {
        console.log("called upload");
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        const fileData = req.file.buffer; // Access the file data as a Buffer
        const fileName = req.query.name; // Assuming you pass the file name as a query parameter
        if (!fileName) {
            return res.status(400).send('File name is missing');
        }
        //tries to remove pathinjections
        const sanitizedFileName = path.basename(fileName);
        sanitizedPath = path.dirname(removePathTraversal(fileName));
        var filePath = path.join(bucket_folder, bucket, snapshot, sanitizedPath)




        // make directory if not exists
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }

        filePath = path.join(filePath, sanitizedFileName);

        //console.log(filePath);
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



    _app.get(`/${bucket}/${snapshot}/getFile`, passport.authenticate('basic', { session: false }), function (req, res) {
        var fileName = req.query.name; // Assuming you pass the file name as a query parameter
        //console.log("a:" + fileName)

        pathName = path.dirname(removePathTraversal(fileName));
        fileName = path.basename(fileName);

        var filePath = path.join(bucket_folder, bucket, snapshot, pathName, fileName);
        //console.log("a:" + fileName)


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

    _app.get(`/${bucket}/${snapshot}/deleteFile`, passport.authenticate('basic', { session: false }), function (req, res) {
        console.log("/deleteFile");
        var fileName = req.query.path; // Assuming you pass the file name as a query parameter
        pathName = path.dirname(removePathTraversal(fileName));
        fileName = path.basename(fileName);
        //console.log("fn: " +fileName);
        //console.log("pn: "+pathName);
        var filePath = path.join("./"+bucket_folder, bucket, snapshot, pathName, fileName);
        //console.log("fp: " +filePath);
        fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error:', err);
            } else {
              console.log('File has been successfully removed.');
            }
          });
        res.send('deleted');






    });

    _app.get(`/${bucket}/${snapshot}/deletesnapshot`, passport.authenticate('basic', { session: false }), function (req, res) {
        const list_of_snapshots = fs.readdirSync(`${bucket_folder}/${bucket}`);
        fs.rm(`${bucket_folder}/${bucket}/${snapshot}`, { recursive: true, force: true }, (error) => {
            console.log(error);
        });
        res.send('deleted');
    });

    _app.get(`/${bucket}/${snapshot}/list`, passport.authenticate('basic', { session: false }), function (req, res) {
        const files = fs.readdirSync(`${bucket_folder}/${bucket}/${snapshot}`);
        
        //get date of creation
        for (let i = 0; i < files.length; i++) {
            files[i] = { name: files[i], date: fs.statSync(`${bucket_folder}/${bucket}/${files[i]}`).birthtime };
        }
        res.send(files);

    });
    _app.get(`/${bucket}/${snapshot}/listall`, passport.authenticate('basic', { session: false }), function (req, res) {
        const folderPath = `${bucket_folder}/${bucket}/${snapshot}`;

        if (!fs.existsSync(folderPath)) {
            res.status(404).send("Directory does not exist");
            return;
        }

        const fileNames = fs.readdirSync(folderPath, { withFileTypes: false, recursive: true });

        const files = fileNames.filter(fileName => {
            const filePath = path.join(folderPath, fileName);
            return fs.statSync(filePath).isFile();
        });

        console.log(files);
        res.send(files);
    });




    _app.get(`/${bucket}/${snapshot}/listallwhash`, passport.authenticate('basic', { session: false }), function (req, res) {
        const folderPath = `${bucket_folder}/${bucket}/${snapshot}`;

        if (!fs.existsSync(folderPath)) {
            res.status(404).send("Directory does not exist");
            return;
        }

        const fileNames = fs.readdirSync(folderPath, { withFileTypes: false, recursive: true });

        const files = fileNames.map(fileName => {
            const filePath = path.join(folderPath, fileName);
            const fileStats = fs.statSync(filePath);

            if (fileStats.isFile()) {
                // Calculate the MD5 hash
                const fileData = fs.readFileSync(filePath);
                const md5hash = crypto.createHash('md5').update(fileData).digest('hex');

                return {
                    filename: fileName,
                    md5hash: md5hash,
                };
            }

            return null;
        }).filter(fileInfo => fileInfo !== null);

        res.send(files);
    });





}

// Function to create a new bucket
function newBucket(_bucketName) {
    if (!fs.existsSync(`${bucket_folder}/${_bucketName}`)){
        fs.mkdirSync(`${bucket_folder}/${_bucketName}`);
        const snapshotName = `${_bucketName}_${Date.now()}`;
        fs.mkdirSync(`${bucket_folder}/${_bucketName}/${snapshotName}`);
        return `${_bucketName} created`;
    }
    return `${_bucketName} already exists`;
}

// Function to create a new snapshot
function newSnapshot(_app, bucketName, snapshotName) {
    fs.mkdirSync(`${bucket_folder}/${bucketName}/${snapshotName}`);
    loadSnapshot(_app, bucketName, snapshotName);
}

// Function to initialize commands
function initCommands(_app) {
    _app.get('/list', passport.authenticate('basic', { session: false }), function (req, res) {
        const buckets = fs.readdirSync(bucket_folder);
        res.send(buckets);
    });

    _app.get('/newbucket', passport.authenticate('basic', { session: false }), function (req, res) {
        const new_bucket_name = req.query.name;
        nbres = newBucket(new_bucket_name);
        const buckets = fs.readdirSync(bucket_folder);
        loadBucket(_app, new_bucket_name);
        res.send(nbres);
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


function createSnapshotWithSymlinks(_app, bucket_folder, bucket, newSnapshotName, lastSnapshotName) {
    // Create a new snapshot folder
    const newSnapshotPath = path.join(bucket_folder, bucket, newSnapshotName);
    fs.mkdirSync(newSnapshotPath, { recursive: true });

    // Get the path of the last snapshot folder
    const lastSnapshotPath = path.join(bucket_folder, bucket, lastSnapshotName);

    // Recursively copy the directory structure and create symlinks for files
    function copyDirectoryStructure(source, destination) {
        const files = fs.readdirSync(source);

        files.forEach((file) => {
            const sourcePath = path.join(source, file);
            const destinationPath = path.join(destination, file);

            if (fs.statSync(sourcePath).isDirectory()) {
                // If it's a directory, create it in the new snapshot and continue to copy its contents
                fs.mkdirSync(destinationPath, { recursive: true });
                copyDirectoryStructure(sourcePath, destinationPath);
            } else {
                // If it's a file, create a symlink to it in the new snapshot
                fs.symlinkSync(sourcePath, destinationPath, 'file');
            }
        });
    }

    copyDirectoryStructure(lastSnapshotPath, newSnapshotPath);

    // Return the name of the new snapshot
    return newSnapshotName;
}