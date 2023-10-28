# NFBBS - Node File Backup Bucket System

NFBBS is a Node.js-based program designed to manage and back up files on a per-machine basis. It offers a container system, referred to as "buckets" to organize snapshots. But it still a work in progress (WIP).

A python interface to interact with NFBBS is going to be made ASAP.

## Table of Contents

- [API Overview](#api-overview)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## API Overview
NFBBS provides an HTTP API for managing buckets and file uploads. You can create, list, and delete buckets, as well as upload and retrieve files within buckets.

## Installation
To set up NFBBS, follow these steps:

1. Clone this repository:

   ```sh
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. Install the required packages using npm:

   ```sh
   npm install
   ```

3. Configure your passport authentication.

## Usage

To use the HTTP API, follow these instructions:
### Initializing the Bucket Handler
To use the HTTP API, first initialize the Bucket Handler:

```javascript
const Buckethandler = require('./path/to/Buckethandler');
const passport = ...; // Initialize passport authentication
const buckets = Buckethandler('your-bucket-folder', passport);
```

### API Authentication
Before making any requests, ensure that you're authenticated using passport. The routes mentioned below require authentication.

### Create a New Bucket
**Endpoint:** `POST /newbucket`
**Request:**
```json
{
  "name": "my-new-bucket"
}
```
**Response:**
```json
{
  "message": "Bucket created successfully"
}
```

### List All Buckets
**Endpoint:** `GET /list`
**Response:**
```json
[
  "bucket1",
  "bucket2"
]
```
### List All Snapshots in a Bucket
**Endpoint:** `GET /bucketName/list`
**Response:**
```json
[
  "BucketName_date",
  "BucketName_date2"
]
```

### Add a File to a Snapshot
**Endpoint:** `POST /bucketName/snapshotName/addFile`

**Request:**
```json
{
  "file": (file data),
  "name": "my-file.txt"
}
```
**Response:**
```json
{
  "message": "File added to the bucket successfully"
}
```

### Retrieve a File from a Snapshot
**Endpoint:** `GET /bucketName/snapshotName/getFile`
**Response:**
```
(File content)
```

## Contributing
We welcome contributions from the community to help improve NFBBS. If you'd like to contribute, please follow these steps:
1. Fork the repository on GitHub.
2. Clone your forked repository to your local machine.
3. Create a new branch for your feature or bug fix.
4. Make your changes and commit them with descriptive messages.
5. Push your changes to your GitHub repository.
6. Create a pull request to the main NFBBS repository.
7. We will review your changes and merge them if they align with the project's goals.

## License
NFBBS is open-source software released under the BSD 3-Clause. See the `LICENSE` file for more details.
