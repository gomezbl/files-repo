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

    readDirectory: function( fullPath ) {
        return new Promise( (resolve,reject) => {
            fs.readdir( fullPath, (err,files) => {
                if (err) reject(err);
                else resolve(files);
            })
        });
    },

    fileStat: function( fullPath ) {
        return new Promise( (resolve,reject) => {
            fs.stat( fullPath, (err,stats) => {
                if ( err ) reject(err);
                else resolve(stats);
            });
        })
    },

    deleteFile: function( fullPath ) {
        return new Promise( (resolve,reject) => {
            fs.unlink( fullPath, (err) => {
                if ( err )  {
                    reject(err);
                }
                else resolve();
            })
        });
    },

    ensureDir: async function( path ) {
        return fsExtra.ensureDir(path);
    },

    newUUID: () => {
        return UUID().split('-').join('');
    }
}