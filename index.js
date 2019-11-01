"use strict";

const Utils = require("./lib/utils");
const Path = require("path");
const fs = require("fs");

class FilesManagerHelper {
    locationFromFileId( fileId, size ) {
        return fileId.slice(-size).toLowerCase();
    }
}

class FilesManager {
    /* 
     * config is a json with these properties:
     *    Path: full path to locate the files repository
     *    Size: [1...8], size of folder to allocate files. 1 to small file respository (hundred of files),
     *                   8 for huge repositories (hundred of thousands of files). Bigger size, implied less 
     *                   number of files in each folder.
     */
    constructor(config) {
        if ( config.Size < 1 || config.Size > 8 ) throw Error(`Size of repository of ${config.Size} not valid. Allowed from 1 to 8`);
 
        this.config = config;
        this.Helper = new FilesManagerHelper();
    }

    async AddExistingFile( pathToFile, fileId ) {
        if ( !(await Utils.fileExists(pathToFile)) ) throw `File not exists: ${pathToFile}`;

        let ext = Path.extname(pathToFile);

        if ( typeof fileId == 'undefined' ) {
            fileId = Utils.newUUID();
        }
        
        let fileContent = await Utils.readFile( pathToFile );
        let fileFolder = Path.join( this.config.Path, this.Helper.locationFromFileId(fileId, this.config.Size) );
        let fullPathToFileInRepo = Path.join( fileFolder, fileId );
        
        await Utils.ensureDir( fileFolder );
        await Utils.saveFile( fullPathToFileInRepo + ext, fileContent );

        let manifest = {
            fileId: fileId,
            length: fileContent.length,
            extension: ext.substr(1),
            created: new Date(),
            location: fullPathToFileInRepo + ext
        }

        await Utils.saveFile( fullPathToFileInRepo+".manifest", JSON.stringify(manifest) );

        return fileId;
    }

    async AllocateNewFileLocation( fileExtension ) {
        let fileId = Utils.newUUID();
        let fileFolder = Path.join( this.config.Path, this.Helper.locationFromFileId(fileId, this.config.Size) );        
        let fullPathToFileInRepo = Path.join( fileFolder, fileId+"."+(fileExtension ? fileExtension : "bin") );
        let fullPathToManifest = Path.join( fileFolder, fileId+".manifest" );        

        await Utils.ensureDir( fileFolder );

        let manifest = {
            fileId: fileId,
            length: -1,
            extension: fileExtension,
            created: new Date(),
            location: fullPathToFileInRepo
        }

        await Utils.saveFile( fullPathToManifest, JSON.stringify(manifest) );

        return manifest;
    }

    async AddFromBuffer( bufferContent, fileExtension ) {
        let fileId = Utils.newUUID();
        let fileFolder = Path.join( this.config.Path, this.Helper.locationFromFileId(fileId, this.config.Size) );
        let fullPathToFileInRepo = Path.join( fileFolder, fileId );
        
        let ext = fileExtension ? fileExtension : "bin";

        await Utils.ensureDir( fileFolder );
        await Utils.saveFile( fullPathToFileInRepo + "." + ext, bufferContent );

        let manifest = {
            fileId: fileId,
            length: bufferContent.length,
            extension: ext,
            created: new Date(),
            location: fullPathToFileInRepo + "." + ext
        }

        await Utils.saveFile( fullPathToFileInRepo+".manifest", JSON.stringify(manifest) );

        return fileId;
    }

    async ReadFile( fileId ) {
        let fileFolder = Path.join( this.config.Path, this.Helper.locationFromFileId(fileId, this.config.Size) );
        let fullPathToFileInRepo = Path.join( fileFolder, fileId );
        let fullPathToFileManifest = fullPathToFileInRepo+".manifest";

        if ( !(await Utils.fileExists(fullPathToFileInRepo+".manifest")) ) throw `Unable to locate file manifest with id ${fileId}`;

        let manifest = JSON.parse(await Utils.readFile( fullPathToFileManifest ) );

        fullPathToFileInRepo += ".";
        fullPathToFileInRepo += manifest.extension;

        if ( !(await Utils.fileExists(fullPathToFileInRepo)) ) throw `Unable to locate file with id ${fileId}`;

        return Utils.readFile( fullPathToFileInRepo );
    }

    async ExistsFile( fileId ) {
        let fileFolder = Path.join( this.config.Path, this.Helper.locationFromFileId(fileId, this.config.Size) );
        let fullPathToFileInRepo = Path.join( fileFolder, fileId );

        return await Utils.fileExists(fullPathToFileInRepo+".manifest");
    }

    async DeleteFile( fileId ) {
        let fileFolder = Path.join( this.config.Path, this.Helper.locationFromFileId(fileId, this.config.Size) );
        let fullPathToFileInRepo = Path.join( fileFolder, fileId );
        let fullPathToFileManifest = fullPathToFileInRepo+".manifest";

        if ( !(await Utils.fileExists(fullPathToFileInRepo+".manifest")) ) throw `Unable to locate file manifest with id ${fileId}`;

        let manifest = JSON.parse(await Utils.readFile( fullPathToFileManifest ) );

        fullPathToFileInRepo += ".";
        fullPathToFileInRepo += manifest.extension;

        if ( !(await Utils.fileExists(fullPathToFileInRepo)) ) throw `Unable to locate file with id ${fileId}`;

        await Utils.deleteFile( fullPathToFileInRepo );
        await Utils.deleteFile( fullPathToFileManifest );
    }

    async GetFullPathToFile( fileId ) {
        let fileFolder = Path.join( this.config.Path, this.Helper.locationFromFileId(fileId, this.config.Size) );
        let fullPathToFileInRepo = Path.join( fileFolder, fileId );

        if ( !(await Utils.fileExists(fullPathToFileInRepo+".manifest")) ) throw `Unable to locate file manifest with id ${fileId}`;

        let manifest = JSON.parse(await Utils.readFile( fullPathToFileInRepo+".manifest") );

        fullPathToFileInRepo += ".";
        fullPathToFileInRepo += manifest.extension;

        return fullPathToFileInRepo;
    }

    async GetFileManifest( fileId ) {
        let fileFolder = Path.join( this.config.Path, this.Helper.locationFromFileId(fileId, this.config.Size) );
        let fullPathToFileInRepo = Path.join( fileFolder, fileId );

        if ( !(await Utils.fileExists(fullPathToFileInRepo+".manifest")) ) throw `Unable to locate file manifest with id ${fileId}`;

        return JSON.parse(await Utils.readFile( fullPathToFileInRepo+".manifest") );
    }

    async IterateAll( fnc, path ) {
        let currentPath = path ? path : this.config.Path;
        let files = await Utils.readDirectory( currentPath );
        
        for( let file of files ) {
            let fullPath = Path.join( currentPath, file );
            if ( fullPath.endsWith( ".manifest")) {
                let jsonManifest = JSON.parse( await Utils.readFile( fullPath ) );
                await fnc( jsonManifest );
            } else {
                let stats = await Utils.fileStat( fullPath );
    
                if ( stats.isDirectory() ) {
                    await this.IterateAll( fnc, fullPath );
                }    
            }
        }
    }
}

module.exports = (config) => new FilesManager(config);