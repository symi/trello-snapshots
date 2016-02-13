#trello-snapshots

A snapshotting library for polling Trello and persisting serialised versions of boards to disk.

Can be used as a backup method for saving snapshots of boards *(note - only a large subset of board data is stored)* or
retrieving data from boards at regular intervals.

#Usage
To use *trello-snapshots* add the npm package to your project.
```
npm i trello-snapshots
```
You will need to get a Trello API key and token. To allow *trello-snapshots* to pull data you will need a read token. To get your key and token follow the steps: 
 1. Sign in to Trello and navigate to [https://trello.com/app-key](https://trello.com/app-key).
 2. Navigate to https://trello.com/1/connect?key=...&name=MyApp&response_type=token&scope=read, substituting your key in.

##Basic Usage
```javascript
const Snapshotter = require('trello-snapshots')

let mySnapshotter = new Snapshotter(key, token, 'my board', './snapshots');
mySnapshotter.start();
```
##API
###new Snapshotter(key: String, token: String, boardName: String, fileStorePath: ?String): Snapshotter
Creates a new snapshotter. fileStorePath is optional, if not passed in then a local folder to this package is used.
*TODO: relative paths to caller?*

###start(): void
Starts polling.

###stop(): void
Stops polling.

###snapShotRate: Number
Setter for the rate in milliseconds, at which to snapshot. 
If 0 then .start() will only poll once.

*Default: 20 minutes*

###persistRate: Number
Setter for the frequency at which to save a snapshot at. 
If 0 then snapshots are never saved.

*Default: 1*

###preCondition(handler: Function): void
Setter for the handler to be called when a poll begins before data is pulled.
Handler function is passed snapshot time (Date) and the poll count (Number).
To stop a poll from continuing return false (Boolean).

###onSnapshot(handler: Function): void
Setter for the handler to be called when a poll completes.
Handler function is passed the board (Trello-Object), snapshot time (Date) and the poll count (Number).

###*write(data: Any, date: Date): void
Manully write into the file store. Events out 'file-write'.

###*read(date1: Date, date2: ?Date): Array<{ timestamp: Date, data: Any }>
Reads files from the file store. If only date1 is supplied then only files created with that timestamp are returned.
If both dates are supplied then files within the date range are returned.

###*readLatest(): { timestamp: Date, data: Any }
Reads the latest file in the file store.

###*readLastX(count: Number): Array<{ timestamp: Date, data: Any }>
Reads the last x number of files in the file store.

###*readAll(): Array<{ timestamp: Date, data: Any }>
Reads all files in the file store

##Events
*trello-snapshots* uses co-events and so event handlers can be generator functions.
The Snapshotter class extends co-events so has methods such as .on.

###preSnapshot
Emitted When a poll begins before data is pulled.
Handlers are passed snapshot time (JSDate) and the poll count (Number).

###snapshot
Emitted when a poll completes.
Hanlders are passed the board (Trello-Object), snapshot time (JSDate) and the poll count (Number).

###file-write
Emitted when a file is written to the file store.

##Contribution
Feel free to extend, use and contribute to the project! Test coverage should be coming soon. However due to the lack of test coverage, there may be bugs present, please raise an issue or PR.

