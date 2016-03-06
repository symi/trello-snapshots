'use strict';
const co = require('co'),
    trello = require('trello-objects'),
    FileStore = require('./FileStore'),
    mixin = require('mixin');

/** 
 * Class representing a snapshotter, contains methods to poll trello 
 * and event/return data at set intervals.
 * @extends FileStore
 * @class
 * @public
 */
class Snapshotter extends FileStore {
    /**
     * Create a Snapshotter.
     * @param {string} key - Trello Api key.
     * @param {string} token - Trello Api token.
     * @param {string} boardName - The name of the board to snapshot on Trello.
     * @param {string} [fileStorePath=../Data] - The file path to save snapshots at. 
     */
    constructor(key, token, boardName, fileStorePath) {
        super(fileStorePath || '../Data');
        this._boardName = boardName;
        this._trello = trello(key, token);
        this._snapshotRate = 20 * 60 * 1000; // default every 20 minutes
        this._persistRate = 1; // saves everytime       
        this._count = 0;
        this._onSnapshot;        
        this._onPreCondition;
    }

    /**
     * Starts polling the trello board with the settings defined on the Snapshotter class.
     * Resets count to 0.
     * @emits preSnapshot
     * @emits snapshots
     * @public
     */
    start() { 
        let me = this;
        
        this._count = 0;
                
        setImmediate(() => co(function*() { 
            yield* me._snapshot();
        }).catch(err => console.dir(err.stack)));
        
        if (!this._snapshotRate) return;
        
        this._token = setInterval(() => co(function*() { 
            yield* me._snapshot();
        }).catch(err => console.dir(err.stack)), this._snapshotRate)
    }

    /**
     * Stops polling of the trello board.
     * @public
     */    
    stop() {
        if(this._token) {
            clearInterval(this._token);
        }
    }
    
    /**
     * Sets the snapshot rate, the rate at which the snapshotter will poll the trello board.
     * If 0 then .start() will only poll once.
     * @param {number} [rate=1200000] - The rate in milliseconds (default 20 minutes).
     * @throws Snapshot rate must be an integer.
     * @public
     */
    set snapshotRate(rate) {
        if (!Number.isInteger(rate)) {
            throw new Error('Snapshot rate must be an integer');
        }
        
        this._snapshotRate = rate;
    }
    
    /**
     * Sets the persist rate, the rate at which the snapshotter save the result from polling the board.
     * If 0 then snapshots are neve saved.
     * @param {number} [rate=1] - The rate in milliseconds.
     * @throws Persist rate must be an integer.
     * @public
     */
    set persistRate(rate) {
        if (!Number.isInteger(rate)) {
            throw new Error('Persist rate must be an integer');
        }
        
        this._persistRate = rate;
    }
    
    /**
     * Setter for the handler to be called when a poll begins before data is pulled..
     * @param {preCondition} handler The handler function.
     * @throws Pre-condition handler must be a function or undefined.
     * @public
     */
    set preCondition(handler) {
        if (typeof handler !== 'function' && handler !== undefined) {
            throw new Error('Pre-condition handler must be a function or undefined');
        }
        
        this._onPreCondition = handler;
    }
    
    /**
     * Setter for the handler to be called when a poll completes. 
     * @param {onSnapshot} handler The handler function.
     * @throws Snapshot handler must be a function or undefined.
     * @public
     */
    set onSnapshot(handler) {
        if (typeof handler !== 'function' && handler !== undefined) {
            throw new Error('Snapshot handler must be a function or undefined');
        }
        
        this._onSnapshot = handler;
    }

    /**
     * Do a snapshot, emits various events and calls callbacks.
     * Checks for persistance each snapshot.
     * @private
     * @generator
     */   
    *_snapshot() {
        this._count++;
        
        let snapshotTime = new Date();
        
        /**
         * @event preSnapshot
         * @param {data} date - The date of the snapshot.
         * @param {number} count - The count of the snapshot.
         */
        this.emit('preSnapshot', snapshotTime, this._count);
        
        /**
         * preCondition handler, is given the time of the snapshot and count, can return false
         * to stop the current snapshot from continuing.
         * 
         * @callback preCondition
         * @param {date} snapshotTime - The time that the snapshot was taken.
         * @param {number} counts - The count of the snapshot (count since .start() was called).
         * @return {boolean} Return false to stop the current snapshot. 
         */ 
        if (this._onPreCondition && this._onPreCondition(snapshotTime, this._count) === false) {
            return;
        }
        
        try {
            let board;            
            board = yield* this._trello.Board.getBulk(this._boardName);
            
            if (this._persistRate !== 0 
                && (this._count % this._persistRate === 0)) {
                yield* this.write(board.raw, snapshotTime);
            }
            
            /**
             * @event snapshot
             * @param {GoodTrelloBoard} board - The board itself.
             * @param {data} date - The date of the snapshot.
             * @param {number} count - The count of the snapshot.
             */
            this.emit('snapshot', board, snapshotTime, this._count);
            
            /**
             * onSnapshot handler, is given the board, time of the snapshot and count.
             *  
             * @callback onSnapshot
             * @param {GoodTrelloBoard} board - The board data.
             * @param {date} snapshotTime - The time that the snapshot was taken.
             * @param {number} counts - The count of the snapshot (count since .start() was called).
             */
            if (this._onSnapshot) {
                this._onSnapshot(board, snapshotTime, this._count);
            }
        } catch (ex) {
            console.error(`Error whilst getting snapshot at ${snapshotTime}`);
            console.dir(ex.stack);
            this._count--;
            return;
        }
    }
}

exports = module.exports = Snapshotter;