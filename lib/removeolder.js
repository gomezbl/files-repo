"use strict";

const NodeCron = require("node-cron");

const CRONJOBCONFIGURATION = "0 */1 * * * *"; // Every minute

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
        instance.filesToRemove = [];

        try {
            let fileDate = new Date(fileManifest.created);
        
            if ( instance.ShouldBeRemoved(fileDate) ) {
                instance.filesToRemove.push( fileManifest.fileId );                
            }
        } catch(err) {
            throw Error(`Exception when removing file ${fileManifest}: ${err.message}`);
        }
    }
    
    async CheckFilesToRemove() {
        await this.filesManager.IterateAll( this.checkFile );

        for( let fileIdToRemove of this.filesToRemove ) {
            await this.filesManager.DeleteFile( fileIdToRemove );
        }
    }        
}

module.exports = function( FilesManager, seconds ) {
    return new RemoveOlder( FilesManager, seconds );
}