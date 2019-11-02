"use strict";

const path = require("path");
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

    readDirectories: function( fullPath ) {
        return new Promise( (resolve,reject) => {
            fs.readdir( fullPath, (err,files) => {
                if (err) reject(err);
                else {
                    let directories = [];

                    for( let file of files ) {
                        let fullPathToFile = path.join(fullPath,file);
                        let fileStat = fs.statSync( fullPathToFile );
                        
                        if ( fileStat.isDirectory() ) {
                            directories.push( fullPathToFile )
                        }
                    }

                    resolve( directories );
                }
            })
        });
    },


    readFilesWithExtension: function( fullPath, extension ) {
        return new Promise( (resolve,reject) => {
            fs.readdir( fullPath, (err,files) => {
                if (err) reject(err);
                else {
                    let filesInDirectory = [];

                    for( let file of files ) {
                        let fullPathToFile = path.join(fullPath,file);

                        if ( path.extname(file).substr(1) == extension ) {
                            filesInDirectory.push( fullPathToFile )
                        }
                    }

                    resolve( filesInDirectory );
                }
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

    appendFile: function( filePathToAppend, detinationFilePath ) {
        return new Promise( (resolve,reject) => {
            this.readFile(filePathToAppend)
                 .then( (data) => {
                    fs.open(detinationFilePath, 'a', (err, fd) => {
                        if (err) reject(err);
                        else {
                            fs.appendFile(fd, data, (err) => {
                              fs.close(fd, (err) => {
                                if (err) reject(err);
                                else resolve();
                              });
                              if (err) reject(err);
                            });
                        }
                      });        
                 })
                 .catch( (err) => reject(err) );
        });
    },

    ensureDir: async function( path ) {
        return fsExtra.ensureDir(path);
    },

    newUUID: () => {
        return UUID().split('-').join('');
    }
}