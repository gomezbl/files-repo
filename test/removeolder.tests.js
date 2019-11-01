"use strict";

const Path = require("path");
const Assert = require("chai").assert;
const RemoveOlder = require("../lib/removeolder");

const Files = require("..");
const PATH_TO_TEST_FILES = "testfilesrepository";
const PATH_TO_FILES_REPOSITORY = Path.join( __dirname, PATH_TO_TEST_FILES );
const TESFILESDIRECTORY = "samplefiles";
const PATH_TO_SAMPLE_FILES = Path.join( __dirname, TESFILESDIRECTORY );
const REPOSITORY_SIZE = 1;
const SECONDSOLDERTOREMOVE = 1;

let filesManager = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE } );
let removeOlder = RemoveOlder( filesManager, SECONDSOLDERTOREMOVE );

describe( '@gomezbl/removeolder tests', () => {
    it( "ShouldBeRemoved with older date", () => {
        let oldDate = new Date( new Date().getTime() - 10*60000 );
        Assert.isTrue( removeOlder.ShouldBeRemoved( oldDate ) );
    });

    it( "ShouldBeRemoved with current date", () => {
        Assert.isFalse( removeOlder.ShouldBeRemoved( new Date() ) );
    });

    it( "CheckFilesToRemove", async() => {
        await removeOlder.CheckFilesToRemove();
    });

    it( "Add and check removed files", async() => {
        const COUNT = 10;

        let ro = RemoveOlder( filesManager, 0 );

        for( let i = 0; i < COUNT; i++ ) {
            await filesManager.AddExistingFile( Path.join( PATH_TO_SAMPLE_FILES, "testfile01.txt" ) );
        }

        let filesRemovedCount = await ro.CheckFilesToRemove();
        
        Assert.isTrue( filesRemovedCount >= COUNT );
    });
});