"use strict";

const Utils = require("./lib/utils");
const Path = require("path");
const RemoveOlder = require("./lib/removeolder");

const DEFAULT_SIZE = 2;

class FilesManagerHelper {
    locationFromFileId( fileId, size ) {
        return fileId.slice(-size).toLowerCase();
    }
}

class FilesManager {
    /* 
     * config is a json with these properties:
     *    Path (mandatory): full path to locate the files repository
     *    Size (optional): [1...8], size of folder to allocate files. 1 to small file respository (hundred of files),
     *                   8 for huge repositories (hundred of thousands of files). Bigger size, implied less 
     *                   number of files in each folder. Default: 2
     *    RemoveOlderFiles (optional): x, removes all files older than x seconds.
     */
    constructor(config) {
        let size = config.Size ? config.Size : DEFAULT_SIZE; 
        if ( size < 1 || size > 8 ) throw Error(`Size of repository of ${size} not valid. Allowed from 1 to 8`);

        this.config = config;
        this.config.Size = size;

        this.Helper = new FilesManagerHelper();

        if ( config.RemoveOlderFiles ) {
            this.removeOlder = RemoveOlder(this. config.RemoveOlderFiles);
            this.removeOlder.StartCronToRemoveOlderFiles();
        }
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

        let manifestContent = await Utils.readFile( fullPathToFileManifest );
        let manifest = JSON.parse( manifestContent );

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

    async IterateAllFromPath( fnc, currentPath ) {
        let files = await Utils.readDirectory( currentPath );
        
        for( let file of files ) {
            let fullPath = Path.join( currentPath, file );
            let stats = await Utils.fileStat( fullPath );

            if ( stats.isDirectory() ) {
                let goon = await this.IterateAllFromPath( fnc, fullPath );

                if ( !goon ) return false;
            } else {
                if ( fullPath.endsWith( ".manifest")) {                    
                    let jsonManifest = JSON.parse( await Utils.readFile( fullPath ) );
                    let goon = await fnc( jsonManifest );

                    if (!goon) return false;
                }
            }
        }

        return true;
    }

    async IterateAll( fnc ) {
        await this.IterateAllFromPath( fnc, this.config.Path );
    }

    async FilesCount() {
        let filesRead = 0;
        let countFilesCallback = async function( fileManifest ) { filesRead++; return true; }

        await this.IterateAll( countFilesCallback );

        return filesRead;
    }

    async EmptyRepository() {
        const BUNCH = 100;
        let filesIdToRemove = [];
        let filesRemoved = 0;

        let addFileToRemove = function( fileManifest ) { 
            filesIdToRemove.push(fileManifest.fileId);
            
            return filesIdToRemove.length < BUNCH; 
        }
        
        do 
        {
            filesIdToRemove = [];

            await this.IterateAll( addFileToRemove );

            for( let fileId of filesIdToRemove ) {
                await this.DeleteFile( fileId );
            }

            filesRemoved += filesIdToRemove.length;
        } while( filesIdToRemove.length > 0 );

        return filesRemoved;
    }
}

module.exports = (config) => new FilesManager(config);