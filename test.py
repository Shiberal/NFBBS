import requests

# Change this URL to the appropriate endpoint of your Node.js application
base_url = 'http://localhost:3000'  # Replace with your actual server URL

# Test creating a new bucket
def test_create_bucket(bucket_name):
    response = requests.get(f'{base_url}/newbucket?name={bucket_name}')
    print(response.text)

# Test listing all buckets
def test_list_buckets():
    response = requests.get(f'{base_url}/list')
    print(response.text)

# Test creating a new snapshot in a specific bucket
def test_create_snapshot(bucket_name):
    response = requests.get(f'{base_url}/{bucket_name}/newsnapshot')
    print(response.text)
    return response.text;

# Test listing all snapshots in a specific bucket
def test_list_snapshots(bucket_name):
    response = requests.get(f'{base_url}/{bucket_name}/list')
    print(response.text)

# Test uploading a file to a specific snapshot
def test_upload_file(bucket_name, snapshot_name, file_name, file_content):
    response = requests.post(f'{base_url}/{bucket_name}/{snapshot_name}/addFile?name={file_name}', files={'file': file_content})
    print(response.text)

# Test listing files in a specific snapshot
def test_list_files(bucket_name, snapshot_name):
    response = requests.get(f'{base_url}/{bucket_name}/{snapshot_name}/list')
    print(response.text)

# Test downloading a file from a specific snapshot
def test_download_file(bucket_name, snapshot_name, file_name):
    response = requests.get(f'{base_url}/{bucket_name}/{snapshot_name}/getFile?name={file_name}')
    if response.status_code == 200:
        with open(file_name, 'wb') as file:
            file.write(response.content)
        print(f'File "{file_name}" downloaded successfully.')
    else:
        print(response.text)

# Test deleting a specific snapshot
def test_delete_snapshot(bucket_name, snapshot_name):
    response = requests.get(f'{base_url}/{bucket_name}/{snapshot_name}/deletesnapshot')
    print(response.text)

# Test deleting a specific bucket
def test_delete_bucket(bucket_name):
    response = requests.get(f'{base_url}/{bucket_name}/deletebucket')
    print(response.text)

if __name__ == "__main__":
    # Replace these values with your desired bucket, snapshot, and file names
    bucket_name = "my_bucket"
    snapshot_name = ""
    file_name = "example.txt"
    file_path = "/subfolder/../"
    file_content = b"This is the content of the file."

    test_create_bucket(bucket_name)
    test_list_buckets()
    snapshot_name = test_create_snapshot(bucket_name)
    test_list_snapshots(bucket_name)
    test_upload_file(bucket_name, snapshot_name, file_path+file_name, file_content)
    test_list_files(bucket_name, snapshot_name)
    test_download_file(bucket_name, snapshot_name, file_path + file_name)
    #test_delete_snapshot(bucket_name, snapshot_name)
    #test_delete_bucket(bucket_name)
