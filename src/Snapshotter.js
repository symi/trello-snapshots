const co = require('co'),
    trello = require('trello-objects'),
    coEvents = require('co-events'),
    FileStore = require('./FileStore'),
    mixin = require('mixin');

// TODO: check mixin will correctly mimic double extends?!?!
class Snapshotter extends mixin(coEvents, FileStore) {
    constructor(key, token, boardName, fileStorePath) {
        super(fileStorePath || '../Data'); // TODO: dont believe this will work tbh.
        this._boardName = boardName;
        this._trello = trello(key, token);
        this._snapshotRate = 20 * 60 * 1000; // default every 20 minutes
        this._persistRate = 1; // saves everytime       
        this._count = 0;
        this._onSnapshot;        
        this._onPreCondition;
    }

    *start() { 
        let me = this;
        
        this._count = 0;
                
        setImmediate(() => co(function*() { 
            yield* me._snapshot();
        }));
        
        if (!this._snapshotRate) return;
        
        this._token = setInterval(() => co(function*() { 
            yield* me._snapshot();
        }), this._snapshotRate)
    }

    stop() {
        if(this._token) {
            clearInterval(this._token);
        }
    }
    
    set snapshotRate(rate) {
        if (!Number.isInteger(rate)) {
            throw new Error('Snapshot rate must be an integer');
        }
        
        this._snapshotRate = rate;
    }
    
    set persistRate(rate) {
        if (!Number.isInteger(rate)) {
            throw new Error('Persist rate must be an integer');
        }
        
        this._persistRate = rate;
    }
    
    set preCondition(handler) {
        if (typeof handler !== 'function' && handler !== undefined) {
            throw new Error('Pre-condition handler must be a function or undefined');
        }
        
        this._onPreCondition = handler;
    }
    
    set onSnapshot(handler) {
        if (typeof handler !== 'function' && handler !== undefined) {
            throw new Error('Snapshot handler must be a function or undefined');
        }
        
        this._onSnapshot = handler;
    }

    *_snapshot() {
        this._count++;
        
        let snapshotTime = new Date();
        
        this.emit('preSnapshot', snapshotTime, this._count);
        
        if (this._onPreCondition && this._onPreCondition(this._count, snapshotTime) === false) {
            return;
        }
        
        try {
            let board;            
            board = yield* this._trello.Board.getBulk(this._boardName);
            
            if (this._persistRate !== 0 
                && (this._count % this._persistRate === 0)) {
                yield* this.write(board.raw, snapshotTime);
            }
            
            this.emit('snapshot', board, snapshotTime, this._count);
            
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