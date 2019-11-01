"use strict";

const Assert = require("chai").assert;
const Path = require("path");
const FsExtra = require("fs-extra");

const Files = require("..");
const PATH_TO_TEST_FILES = "testfilesrepository";
const TESFILESDIRECTORY = "samplefiles";

const PATH_TO_FILES_REPOSITORY = Path.join( __dirname, PATH_TO_TEST_FILES );
const PATH_TO_SAMPLE_FILES = Path.join( __dirname, TESFILESDIRECTORY );
const REPOSITORY_SIZE = 1;

let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE } );

describe( '@gomezbl/files tests', () => {
    before( async () => {
       await FsExtra.ensureDir( PATH_TO_FILES_REPOSITORY );
    });

    it( '# Add file to repository from existing file', async() => {        
        let fileId = await f.AddExistingFile( Path.join( PATH_TO_SAMPLE_FILES, "testfile01.txt" ) );

        Assert.equal( fileId.length, 32 );
    });

    it( '# Check estension in manifest', async() => {
        let fileId = await f.AddExistingFile( Path.join( PATH_TO_SAMPLE_FILES, "testfile01.txt" ) );

        let manifest = await f.GetFileManifest( fileId );

        Assert.equal( manifest.extension, "txt" );
    });

    it( '# Try to add no existingfile to repository', async() => {        
        try {
            await f.AddExistingFile( Path.join( PATH_TO_SAMPLE_FILES, "thisfiledoesn'texist.txt" ) );
            Assert.fail();
        } catch(err) {
            // Test works
        }
    });

    it( '# Add file to repository from existing file and read it', async() => {
        let fileId = await f.AddExistingFile( Path.join( PATH_TO_SAMPLE_FILES, "testfile01.txt" ) );
        let fileRead = await f.ReadFile( fileId );

        Assert.equal( fileId.length, 32 );
        Assert.equal( "This is just a sample file", fileRead.toString() );
    });

    it( '# Add file from buffer', async() => {
        let fileBuffer = Buffer.from("This is a test buffer");

        let fileId = await f.AddFromBuffer( fileBuffer );

        Assert.equal( fileId.length, 32 );
    });

    it( '# Add file from buffer 1 byte length', async() => {
        let fileBuffer = Buffer.alloc(1,10);

        let fileId = await f.AddFromBuffer( fileBuffer );
        let fileRead = await f.ReadFile( fileId );

        Assert.isTrue( fileBuffer.equals(fileRead) );
    });

    it( '# Add file from buffer 1025 bytes length', async() => {
        let fileBuffer = Buffer.alloc(1025,10);

        let fileId = await f.AddFromBuffer( fileBuffer );
        let fileRead = await f.ReadFile( fileId );

        Assert.isTrue( fileBuffer.equals(fileRead) );
    });

    it( '# Read file from buffer', async() => {
        let fileBuffer = Buffer.from("This is a test buffer");

        let fileId = await f.AddFromBuffer( fileBuffer );
        let fileRead = await f.ReadFile( fileId );

        Assert.isTrue( fileBuffer.equals(fileRead) );
    });

    it( '# Get file manifest', async() => {
        let fileBuffer = Buffer.from("This is a test buffer");

        let fileId = await f.AddFromBuffer( fileBuffer );
        let fileManifest = await f.GetFileManifest( fileId );

        Assert.isTrue( typeof fileManifest == "object" );
        Assert.isDefined( fileManifest.length );
        Assert.isDefined( fileManifest.extension );
        Assert.isDefined( fileManifest.created );
        Assert.isDefined( fileManifest.location );
    })
    
    it( '# Bad repository size', () => {
        try {
            let f = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: 9  } );
            Assert.fail();
        }catch(err) {}
    });

    it( '# Check if file exists', async() => {
        let fileBuffer = Buffer.from("This is a test buffer");

        let fileId = await f.AddFromBuffer( fileBuffer );
        let exists = await f.ExistsFile( fileId );

        Assert.isTrue( exists );
    });

    it( '# Check no existing file', async() => {
        let fileId = 'BADFILEID0022334432';
        let exists = await f.ExistsFile( fileId );

        Assert.isFalse( exists );
    });

    it( '# Delete file', async() => {
        let fileBuffer = Buffer.from("This is a test buffer");

        let fileId = await f.AddFromBuffer( fileBuffer );
        await f.DeleteFile( fileId );

        let exists = await f.ExistsFile( fileId );

        Assert.isFalse( exists );
    });

    it( '# Iterate all file', async() => {
        let filesRead = 0;
        let callback = async function( fileManifest ) { filesRead++; }

        await f.IterateAll( callback );

        Assert.isTrue( filesRead > 0 );
    });
});