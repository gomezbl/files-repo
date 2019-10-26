Node.js files manager module for easy management of files repository in projects.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the [npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Tested on 10.x Node.js node version.

Installation is done using [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```
$ npm install files-repo
```

## Features

* Ready for handle thousands of files in a repository
* Add files from Buffer type or from an existing file
* Each file, once added, has its own file ID (UUID)
* Each file is saved with a manifest file, which includes date time when the file was added, type, length, etc.
* All files are located at a folder set by configuration
* According to the size indicated, files are distributed in subfolders of 1, 2... up to 8 characters.

## Configuration

```
const FilesManager = require("files-repo");

let f = FilesManager( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE } );
```

Where:

* PATH_TO_FILES_REPOSITORY is an existing folder where to locate all files
* REPOSITORY_SIZE: length of the repository (1..8):
    * 1 for small files repository (hundreds)
    * 2 for bigger files repository (thousands)
    * and so on


## API
### async AddExistingFile( pathToFile, fileId )
Adds an existing file located at 'pathToFile'. If fileId is provided, then will be used as file ID for that existing file.

Returns the file ID for the new file added.

Sample from tests:
```
let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE } );

let fileId = await f.AddExistingFile( Path.join( PATH_TO_SAMPLE_FILES, "testfile01.txt" ) );

Assert.equal( fileId.length, 32 );
```

### async AddFromBuffer( bufferContent, fileExtension )
Adds a new file from a buffer.

Returns the file ID for the new file added.

Sample from tests:
```
let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
let fileBuffer = Buffer.from("This is a test buffer");

let fileId = await f.AddFromBuffer( fileBuffer );

Assert.equal( fileId.length, 32 );
```

### async ReadFile( fileId )
Reads a file given its file ID.

Sample from tests:
```
let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
let fileBuffer = Buffer.from("This is a test buffer");

let fileId = await f.AddFromBuffer( fileBuffer );
let fileRead = await f.ReadFile( fileId );

Assert.isTrue( fileBuffer.equals(fileRead) );
```

### async ExistsFile( fileId )
Checks if a file exists given its file ID

Sample from tests:
```
let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
let fileBuffer = Buffer.from("This is a test buffer");

let fileId = await f.AddFromBuffer( fileBuffer );
let exists = await f.ExistsFile( fileId );

Assert.isTrue( exists );
```

### async DeleteFile( fileId )
Removes file given its file ID

Sample from tests:
```
let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
let fileBuffer = Buffer.from("This is a test buffer");

let fileId = await f.AddFromBuffer( fileBuffer );
await f.DeleteFile( fileId );
```

### async GetFileManifest( fileId )
Gets the JSON file manifest.

This JSON object has this self description properties using one real sample:
```
{
    "fileId": "3598af972306401b925ef163dfa649b3",
    "length": 21,
    "extension": "bin",
    "created": "2019-10-14T07:50:22.945Z",
    "location": "/home/rgb/dev/projects/files/test/testfilesrepository/dfa649b3/3598af972306401b925ef163dfa649b3.bin" }
```

Sample from tests:
```
let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
let fileBuffer = Buffer.from("This is a test buffer");

let fileId = await f.AddFromBuffer( fileBuffer );
let fileManifest = await f.GetFileManifest( fileId );
```

### async IterateAll( fnc )
Iterates by all files in the repository and performs one call by file to fnc function with their filemanifests.

Sample from tests:
```
let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE  } );
let filesRead = 0;
let callback = async function( fileManifest ) { filesRead++; }

await f.IterateAll( callback );

Assert.isTrue( filesRead > 0 );
```