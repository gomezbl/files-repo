const Assert = require("chai").assert;

const Path = require("path");
const PATH_TO_TEST_FILES = "testfilesrepository";

const Files = require("..");
const PATH_TO_FILES_REPOSITORY = Path.join( __dirname, PATH_TO_TEST_FILES );
const REPOSITORY_SIZE = 1;
const NUMBEROFFILES = 10000;

let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE } );

(async () => {
    console.log(`Adding ${NUMBEROFFILES} files...`);

    for( let i = 0; i < NUMBEROFFILES; i++ ) {
        await f.AddFromBuffer( Buffer.from("This is a test buffer") )
    }
 
    console.log("Removing files...");

    await f.EmptyRepository();
    
    filesCount = await f.FilesCount();
    Assert.isTrue( filesCount == 0 );
    console.log("Test passed with success!");
})();
