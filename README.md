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



