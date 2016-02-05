'use strict';
const co = require('co'),
    trello = require('trello-objects'),
    coEvents = require('co-events');

class Snapshotter extends coEvents {
    constructor(key, token, boardName) {
        super();
        this._boardName = boardName;
        this._trello = trello(key, token);
        this._snapshotRate = 20 * 60 * 1000; // default every 20 minutes
        this._saveToFile = true;
        this._saveRate = 1; // saves everytime
        this._onSnapshot;
        this._count = 0;
        this._token;
    }

    *start(onSnapshot, context) { 
        let me = this;
              
        this._onSnapshot = onSnapshot;
        this._context = context;
        this._count = 0;
                
        setImmediate(() => co(function*() { 
            yield* me._snapshot();
        }));
        
        this._token = setInterval(() => co(function*() { 
            yield* me._snapshot();
        }), this._snapshotRate)
    }

    stop() {
        if(this._token) {
            clearInterval(this._token);
        }
        
        this._onSnapshot = undefined;
        this._context = undefined;
    }

    *_snapshot() {
        // todo: pre-shapshot handler/event?
        
        try {
            let snapshotTime = new Date(),
                board;

            this._count++;
            board = yield* this._trello.Board.getBulk(this._boardName);
            
            if (typeof this._onSnapshot === 'function') {
                this._onSnapshot.call(this._context, board);
            }
            
            self.emit('snapshot', board);
            
        } catch(ex) {
            console.error(`Error whilst getting snapshot at ${snapshotTime}`);
            console.dir(ex.stack);
            this._count--;
            return;
        }
    }
}

exports = module.exports = function(key, token, board) {
    return new Snapshotter(key, token, board);
};
