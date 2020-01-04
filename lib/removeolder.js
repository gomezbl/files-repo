"use strict";

const NodeCron = require("node-cron");

const CRONJOBCONFIGURATION = "*/5 * * * * *"; // Every minute

let instance;

class RemoveOlder {
    constructor( FilesManager, seconds ) {
        this.filesManager = FilesManager;
        this.maxSecondsToRemove = seconds;
        this.filesRemoved = 0;

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
        try {
            let fileDate = new Date(fileManifest.created);
        
            if ( instance.ShouldBeRemoved(fileDate) ) {
                await instance.filesManager.DeleteFile( fileManifest.fileId );
                instance.filesRemoved++;
            }

            return true;
        } catch(err) {
            throw Error(`Exception when removing file ${fileManifest}: ${err.message}`);
        }
    }
    
    async CheckFilesToRemove() {
        instance.filesRemoved = 0;

        await instance.filesManager.IterateAll( instance.checkFile );
        
        return instance.filesRemoved;
    }        
}

module.exports = function( FilesManager, seconds ) {
    return new RemoveOlder( FilesManager, seconds );
}