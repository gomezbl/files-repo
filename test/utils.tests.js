"use strict";

const Assert = require("chai").assert;
const FilesUtils = require("../lib/utils");

describe( '@gomezbl/utils tests', () => {
    it( "Get new UUID", () => {
        let newUUID = FilesUtils.newUUID();

        Assert.equal( 'string', typeof newUUID );
        Assert.equal( 32, newUUID.length );
    });

    it( "UUID with no hyphen", () => {
        let newUUID = FilesUtils.newUUID();

        Assert.equal( -1, newUUID.indexOf('-') );
    });
});