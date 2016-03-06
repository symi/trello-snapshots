#trello-snapshots

A snapshotting library for polling Trello and persisting serialised versions of boards to disk.

Can be used as a backup method for saving snapshots of boards *(note - only a large subset of board data is stored)* or
retrieving data from boards at regular intervals.

##Usage
To use *trello-snapshots* add the npm package to your project.
```sh
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
##API Reference
## Classes

<dl>
<dt><a href="#FileStore">FileStore</a> ⇐ <code><a href="https://www.npmjs.com/package/co-events">CoEvents</a></code></dt>
<dd><p>Class representing a FileStore, contains methods to query the file store.</p>
</dd>
<dt><a href="#Snapshotter">Snapshotter</a> ⇐ <code><a href="#FileStore">FileStore</a></code></dt>
<dd><p>Class representing a snapshotter, contains methods to poll trello 
and event/return data at set intervals.</p>
</dd>
</dl>

## Events

<dl>
<dt><a href="#event_file-write">"file-write" (data, date)</a></dt>
<dd></dd>
<dt><a href="#event_preSnapshot">"preSnapshot" (date, count)</a></dt>
<dd></dd>
<dt><a href="#event_snapshot">"snapshot" (board, date, count)</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#preCondition">preCondition</a> ⇒ <code>boolean</code></dt>
<dd><p>preCondition handler, is given the time of the snapshot and count, can return false
to stop the current snapshot from continuing.</p>
</dd>
<dt><a href="#onSnapshot">onSnapshot</a> : <code>function</code></dt>
<dd><p>onSnapshot handler, is given the board, time of the snapshot and count.</p>
</dd>
</dl>

<a name="FileStore"></a>
## FileStore ⇐ <code>[CoEvents](https://www.npmjs.com/package/co-events)</code>
Class representing a FileStore, contains methods to query the file store.

**Kind**: global class  
**Extends:** <code>[CoEvents](https://www.npmjs.com/package/co-events)</code>  
**Access:** public  

* [FileStore](#FileStore) ⇐ <code>[CoEvents](https://www.npmjs.com/package/co-events)</code>
    * [new FileStore(path)](#new_FileStore_new)
    * [.readAll()](#FileStore+readAll) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
    * [.read(date1, date2)](#FileStore+read) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
    * [.readLastX(count)](#FileStore+readLastX) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
    * [.readLatest()](#FileStore+readLatest) ⇒ <code>Object</code>
    * [.write(data, [date])](#FileStore+write)


-

<a name="new_FileStore_new"></a>
### new FileStore(path)
Creates a FileStore


| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The path to store files at. |


-

<a name="FileStore+readAll"></a>
### fileStore.readAll() ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
Reads all the files in the file store.

**Kind**: instance method of <code>[FileStore](#FileStore)</code>  
**Returns**: <code>Array.&lt;{timestamp: date, data: json}&gt;</code> - The files data and timestamp.  
**Access:** public  
**Generator**:   

-

<a name="FileStore+read"></a>
### fileStore.read(date1, date2) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
Reads files from the file store. If only date1 is supplied then only files created with that timestamp are returned. If both dates are supplied then files within the date range are returned.

**Kind**: instance method of <code>[FileStore](#FileStore)</code>  
**Returns**: <code>Array.&lt;{timestamp: date, data: json}&gt;</code> - The files data and timestamp.  
**Throws**:

- A date must be provided.
- An invalid first date was provided.

**Access:** public  
**Thows**: An invalid second date was provided.  
**Generator**:   

| Param | Type | Description |
| --- | --- | --- |
| date1 | <code>date</code> | The start or exact match date. |
| date2 | <code>date</code> | The end date. |


-

<a name="FileStore+readLastX"></a>
### fileStore.readLastX(count) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
Reads the last x number of files in the file store.

**Kind**: instance method of <code>[FileStore](#FileStore)</code>  
**Returns**: <code>Array.&lt;{timestamp: date, data: json}&gt;</code> - The files data and timestamp.  
**Access:** public  
**Generator**:   

| Param | Type | Description |
| --- | --- | --- |
| count | <code>number</code> | The last x number of files to return. |


-

<a name="FileStore+readLatest"></a>
### fileStore.readLatest() ⇒ <code>Object</code>
Reads the lastest file in the file store.

**Kind**: instance method of <code>[FileStore](#FileStore)</code>  
**Returns**: <code>Object</code> - The file's data and timestamp.  
**Access:** public  
**Generator**:   

-

<a name="FileStore+write"></a>
### fileStore.write(data, [date])
Write into the file store. Events out 'file-write'.

**Kind**: instance method of <code>[FileStore](#FileStore)</code>  
**Emits**: <code>[file-write](#event_file-write)</code>  
**Access:** public  
**Generator**:   

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>\*</code> |  | The data to write to file. |
| [date] | <code>date</code> | <code>new Date()</code> | The date of the file write. |


-

<a name="Snapshotter"></a>
## Snapshotter ⇐ <code>[FileStore](#FileStore)</code>
Class representing a snapshotter, contains methods to poll trello and event/return data at set intervals.

**Kind**: global class  
**Extends:** <code>[FileStore](#FileStore)</code>  
**Access:** public  

* [Snapshotter](#Snapshotter) ⇐ <code>[FileStore](#FileStore)</code>
    * [new Snapshotter(key, token, boardName, [fileStorePath])](#new_Snapshotter_new)
    * [.snapshotRate](#Snapshotter+snapshotRate)
    * [.persistRate](#Snapshotter+persistRate)
    * [.preCondition](#Snapshotter+preCondition)
    * [.onSnapshot](#Snapshotter+onSnapshot)
    * [.start()](#Snapshotter+start)
    * [.stop()](#Snapshotter+stop)
    * [.readAll()](#FileStore+readAll) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
    * [.read(date1, date2)](#FileStore+read) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
    * [.readLastX(count)](#FileStore+readLastX) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
    * [.readLatest()](#FileStore+readLatest) ⇒ <code>Object</code>
    * [.write(data, [date])](#FileStore+write)


-

<a name="new_Snapshotter_new"></a>
### new Snapshotter(key, token, boardName, [fileStorePath])
Create a Snapshotter.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  | Trello Api key. |
| token | <code>string</code> |  | Trello Api token. |
| boardName | <code>string</code> |  | The name of the board to snapshot on Trello. |
| [fileStorePath] | <code>string</code> | <code>&quot;../Data&quot;</code> | The file path to save snapshots at. |


-

<a name="Snapshotter+snapshotRate"></a>
### snapshotter.snapshotRate
Sets the snapshot rate, the rate at which the snapshotter will poll the trello board.If 0 then .start() will only poll once.

**Kind**: instance property of <code>[Snapshotter](#Snapshotter)</code>  
**Throws**:

- Snapshot rate must be an integer.

**Access:** public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [rate] | <code>number</code> | <code>1200000</code> | The rate in milliseconds (default 20 minutes). |


-

<a name="Snapshotter+persistRate"></a>
### snapshotter.persistRate
Sets the persist rate, the rate at which the snapshotter save the result from polling the board.If 0 then snapshots are neve saved.

**Kind**: instance property of <code>[Snapshotter](#Snapshotter)</code>  
**Throws**:

- Persist rate must be an integer.

**Access:** public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [rate] | <code>number</code> | <code>1</code> | The rate in milliseconds. |


-

<a name="Snapshotter+preCondition"></a>
### snapshotter.preCondition
Setter for the handler to be called when a poll begins before data is pulled..

**Kind**: instance property of <code>[Snapshotter](#Snapshotter)</code>  
**Throws**:

- Pre-condition handler must be a function or undefined.

**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[preCondition](#preCondition)</code> | The handler function. |


-

<a name="Snapshotter+onSnapshot"></a>
### snapshotter.onSnapshot
Setter for the handler to be called when a poll completes.

**Kind**: instance property of <code>[Snapshotter](#Snapshotter)</code>  
**Throws**:

- Snapshot handler must be a function or undefined.

**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[onSnapshot](#onSnapshot)</code> | The handler function. |


-

<a name="Snapshotter+start"></a>
### snapshotter.start()
Starts polling the trello board with the settings defined on the Snapshotter class.Resets count to 0.

**Kind**: instance method of <code>[Snapshotter](#Snapshotter)</code>  
**Emits**: <code>[preSnapshot](#event_preSnapshot)</code>, <code>event:snapshots</code>  
**Access:** public  

-

<a name="Snapshotter+stop"></a>
### snapshotter.stop()
Stops polling of the trello board.

**Kind**: instance method of <code>[Snapshotter](#Snapshotter)</code>  
**Access:** public  

-

<a name="FileStore+readAll"></a>
### snapshotter.readAll() ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
Reads all the files in the file store.

**Kind**: instance method of <code>[Snapshotter](#Snapshotter)</code>  
**Returns**: <code>Array.&lt;{timestamp: date, data: json}&gt;</code> - The files data and timestamp.  
**Access:** public  
**Generator**:   

-

<a name="FileStore+read"></a>
### snapshotter.read(date1, date2) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
Reads files from the file store. If only date1 is supplied then only files created with that timestamp are returned. If both dates are supplied then files within the date range are returned.

**Kind**: instance method of <code>[Snapshotter](#Snapshotter)</code>  
**Returns**: <code>Array.&lt;{timestamp: date, data: json}&gt;</code> - The files data and timestamp.  
**Throws**:

- A date must be provided.
- An invalid first date was provided.

**Access:** public  
**Thows**: An invalid second date was provided.  
**Generator**:   

| Param | Type | Description |
| --- | --- | --- |
| date1 | <code>date</code> | The start or exact match date. |
| date2 | <code>date</code> | The end date. |


-

<a name="FileStore+readLastX"></a>
### snapshotter.readLastX(count) ⇒ <code>Array.&lt;{timestamp: date, data: json}&gt;</code>
Reads the last x number of files in the file store.

**Kind**: instance method of <code>[Snapshotter](#Snapshotter)</code>  
**Returns**: <code>Array.&lt;{timestamp: date, data: json}&gt;</code> - The files data and timestamp.  
**Access:** public  
**Generator**:   

| Param | Type | Description |
| --- | --- | --- |
| count | <code>number</code> | The last x number of files to return. |


-

<a name="FileStore+readLatest"></a>
### snapshotter.readLatest() ⇒ <code>Object</code>
Reads the lastest file in the file store.

**Kind**: instance method of <code>[Snapshotter](#Snapshotter)</code>  
**Returns**: <code>Object</code> - The file's data and timestamp.  
**Access:** public  
**Generator**:   

-

<a name="FileStore+write"></a>
### snapshotter.write(data, [date])
Write into the file store. Events out 'file-write'.

**Kind**: instance method of <code>[Snapshotter](#Snapshotter)</code>  
**Emits**: <code>[file-write](#event_file-write)</code>  
**Access:** public  
**Generator**:   

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>\*</code> |  | The data to write to file. |
| [date] | <code>date</code> | <code>new Date()</code> | The date of the file write. |


-

<a name="event_file-write"></a>
## "file-write" (data, date)
**Kind**: event emitted  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>json</code> | The contents of the file. |
| date | <code>data</code> | The date of the snapshot. |


-

<a name="event_preSnapshot"></a>
## "preSnapshot" (date, count)
**Kind**: event emitted  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>data</code> | The date of the snapshot. |
| count | <code>number</code> | The count of the snapshot. |


-

<a name="event_snapshot"></a>
## "snapshot" (board, date, count)
**Kind**: event emitted  

| Param | Type | Description |
| --- | --- | --- |
| board | <code>GoodTrelloBoard</code> | The board itself. |
| date | <code>data</code> | The date of the snapshot. |
| count | <code>number</code> | The count of the snapshot. |


-

<a name="preCondition"></a>
## preCondition ⇒ <code>boolean</code>
preCondition handler, is given the time of the snapshot and count, can return falseto stop the current snapshot from continuing.

**Kind**: global typedef  
**Returns**: <code>boolean</code> - Return false to stop the current snapshot.  

| Param | Type | Description |
| --- | --- | --- |
| snapshotTime | <code>date</code> | The time that the snapshot was taken. |
| counts | <code>number</code> | The count of the snapshot (count since .start() was called). |


-

<a name="onSnapshot"></a>
## onSnapshot : <code>function</code>
onSnapshot handler, is given the board, time of the snapshot and count.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| board | <code>GoodTrelloBoard</code> | The board data. |
| snapshotTime | <code>date</code> | The time that the snapshot was taken. |
| counts | <code>number</code> | The count of the snapshot (count since .start() was called). |


-


##Tests
Run tests using `npm test`.

##Contribution
Feel free to extend, use and contribute to the project! Test coverage should be coming soon. However due to the lack of test coverage, there may be bugs present, please raise an issue or PR.

