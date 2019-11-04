"use strict";

const NodeCron = require("node-cron");

const CRONJOBCONFIGURATION = "*/5 * * * * *"; // Every minute

let instance;

class RemoveOlder {
    constructor( FilesManager, seconds ) {
        this.filesManager = FilesManager;
        this.maxSecondsToRemove = seconds;

        instance = this;
    }

    StartCronToRemoveOlderFiles() {
        this.nodeCron = NodeCron.schedule( CRONJOBCONFIGURATION, this.CheckFilesToRemove );    
    }

    ShouldBeRemoved( fileDate ) {
        let currentDate = new Date();

        return ((currentDate - fileDate) / 1000) > this.maxSecondsToRemove;
    }
    
    async checkFile( fileManifest ) {
        const MAXCOUNTTOREMOVE = 100;

        try {
            let fileDate = new Date(fileManifest.created);
        
            if ( instance.ShouldBeRemoved(fileDate) ) {
                instance.filesToRemove.push( fileManifest.fileId );                
            }

            return instance.filesToRemove.length < MAXCOUNTTOREMOVE;
        } catch(err) {
            throw Error(`Exception when removing file ${fileManifest}: ${err.message}`);
        }
    }
    
    async CheckFilesToRemove() {
        let filesRemoved = 0;

        do {
            instance.filesToRemove = [];
            await instance.filesManager.IterateAll( instance.checkFile );
        
            for( let fileIdToRemove of instance.filesToRemove ) {
                await instance.filesManager.DeleteFile( fileIdToRemove );
            }           
            
            filesRemoved += instance.filesToRemove.length;
        } while( instance.filesToRemove.length > 0 );

        return filesRemoved;
    }        
}

module.exports = function( FilesManager, seconds ) {
    return new RemoveOlder( FilesManager, seconds );
}