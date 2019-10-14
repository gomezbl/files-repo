"use strict";

const fs = require("fs");
const fsExtra = require("fs-extra");
const UUID = require("uuid");

module.exports = {
    readFile: function( file ) {
        return new Promise( (resolve,reject) => {
            fs.readFile( file, (err,data) => {
                if ( err ) reject(err);
                else resolve(data);
            })
        });
    },

    fileExists: function( file ) {
        return new Promise( (resolve,reject) => {
            fs.exists( file, (exists) => {
                resolve(exists);
            });
        });
    },

    saveFile: function( file, content ) {
        return new Promise( (resolve,reject) => {
            let stream = fs.createWriteStream( file );

            stream.once( "open", (fd) => {
                stream.write( content );
                stream.end();

                resolve();
            });    
        });
    },

    ensureDir: async function( path ) {
        return fsExtra.ensureDir(path);
    },

    newUUID: () => {
        return UUID().split('-').join('');
    }
}