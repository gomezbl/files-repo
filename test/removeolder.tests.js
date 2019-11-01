"use strict";

const Path = require("path");
const Assert = require("chai").assert;
const RemoveOlder = require("../lib/removeolder");

const Files = require("..");
const PATH_TO_TEST_FILES = "testfilesrepository";
const PATH_TO_FILES_REPOSITORY = Path.join( __dirname, PATH_TO_TEST_FILES );
const REPOSITORY_SIZE = 1;

let filesManager = Files( { Path: PATH_TO_FILES_REPOSITORY, Size: REPOSITORY_SIZE } );
let removeOlder = RemoveOlder( filesManager, 60 );

describe( '@gomezbl/removeolder tests', () => {
    it( "ShouldBeRemoved with older date", () => {
        let oldDate = new Date( new Date().getTime() - 10*60000 );
        Assert.isTrue( removeOlder.ShouldBeRemoved( oldDate ) );
    });

    it( "ShouldBeRemoved with current date", () => {
        Assert.isFalse( removeOlder.ShouldBeRemoved( new Date() ) );
    });

    it( "ChekFilesToRemove", async() => {
        await removeOlder.CheckFilesToRemove();
    });
});