'use strict';
/**
 * @external CoEvents
 * @see https://www.npmjs.com/package/co-events
 */
const promisify = require('promisify-node'),
    mkdirp = promisify('mkdirp'),
    fs = require('fs'),
    pfs = promisify(Object.assign({}, fs)),
    moment = require('moment'),
    path = require('path'),
    CoEvents = require('co-events'),
    DATE_FORMAT = 'YYYY-MM-DD_HH_mm_ss';

/** 
 * Class representing a FileStore, contains methods to query the file store.
 * @extends external:CoEvents
 * @class
 * @public
 */
class FileStore extends CoEvents {
    
    /**
     * Creates a FileStore
     * @param {string} path - The path to store files at.
     */
    constructor(path) {
        super();
        this._path = path;
    }
    
    /**
     * Gets the file names of any files in the file store folder.
     * @return {Array.<string>} A collection of all file names in the folder.
     * @private
     * @generator
     */
    *_getFileNames() {
        const fileNames = [];

        yield mkdirp(this._path);
        
        const files = yield pfs.readdir(this._path);
        
        for (const fileName of files) {
            const stats = yield pfs.stat(path.join(this._path, fileName));
            
            if(!stats.isFile()) continue;
            
            fileNames.push(fileName)
        }
        
        return fileNames;
    }
    
    /**
     * Gets the data for each file.
     * @param {string} fileName - The file name to be used to retrieve data.
     * @return {{timestamp: date, data: json}} The file contents and timestamp against the file.
     * @private
     */
    _getData(fileName) {
        return {
            timestamp: moment(fileName, DATE_FORMAT).toDate(),
            data: require(this._path + '\\' + fileName)
        };
    }  
      
    /**
     * Orders a collection of fileNames by timestamp ascending.
     * @param {Array.<string>} filenames - The collection of filenames.
     * @return {{timestamp: date, name: string}} The ordered filenames.
     * @private
     */
    _orderFileNames(fileNames) {
        return fileNames
            .map(fileName => {
                return { 
                    timestamp: moment(fileName, DATE_FORMAT).toDate(), 
                    name: fileName
                };
            })
            .sort((a, b) => a.timestamp > b.timestamp);
    }
    
    /**
     * Reads all the files in the file store.
     * @return {Array.<{timestamp: date, data: json}>} The files data and timestamp.
     * @public
     * @generator
     */
    *readAll() {
        const fileNames = yield* this._getFileNames(),
            data = [];      
        
        for (const fileName of fileNames) {
            data.push(this._getData(fileName));
        }
        
        return data;
    }
    
    /**
     * Reads files from the file store. 
     * If only date1 is supplied then only files created with that timestamp are returned. 
     * If both dates are supplied then files within the date range are returned.
     * @param {date} date1 - The start or exact match date.
     * @param {date} date2 - The end date.
     * @return {Array.<{timestamp: date, data: json}>} The files data and timestamp.
     * @throws A date must be provided.
     * @throws An invalid first date was provided.
     * @thows An invalid second date was provided.
     * @public
     * @generator
     */
    *read(date1, date2) {
        if (date1 == null) {
            throw new Error('A date must be provided');
        }
        
        if (!moment(date1).isValid()) {
            throw new Error('An invalid first date was provided');
        }
        
        if (date2 != null && !moment(date2).isValid()) {
            throw new Error('An invalid second date was provided');
        }
        
        // using moment to remove anything less than a second percision... needs changing!
        const start = moment(moment(date1).format(DATE_FORMAT), DATE_FORMAT).toDate(),
            end = moment(moment(date2).format(DATE_FORMAT), DATE_FORMAT).toDate(),
            data = [];
        
        let fileNames = this._orderFileNames(yield* this._getFileNames());  
          
        if (end == null) {
            fileNames = fileNames.filter(fileName => +fileName.timestamp === +start) || [];
        } else {
            fileNames = fileNames.filter(fileName => fileName.timestamp >= start && fileName.timestamp <= end) || [];
        }
        
        for (const fileName of fileNames) {
            data.push(this._getData(fileName.name));
        }
            
        return data;
    }
    
    /**
     * Reads the last x number of files in the file store.
     * @param {number} count - The last x number of files to return.
     * @return {Array.<{timestamp: date, data: json}>} The files data and timestamp.
     * @public
     * @generator
     */
    *readLastX(count) {
        if (!Number.isInteger(count) || count < 1) {
            throw new Error('Last count must be a positive integer'); 
        }
        const data = [];
        let fileNames = this._orderFileNames(yield* this._getFileNames());
        
        fileNames = fileNames.slice(-count);
        
        for (const fileName of fileNames) {
            data.push(this._getData(fileName.name));
        }
            
        return data;
    }
    
    /**
     * Reads the lastest file in the file store.
     * @return {{timestamp: date, data: json}} The file's data and timestamp.
     * @public
     * @generator
     */
    *readLatest() {
        const fileNames = this._orderFileNames(yield* this._getFileNames());  
        if (!fileNames.length) return {};          
        return this._getData(fileNames[fileNames.length - 1].name);
    }
    
    /**
     * Write into the file store. Events out 'file-write'.
     * @param {*} data - The data to write to file.
     * @param {date} [date=new Date()] - The date of the file write.
     * @emits file-write
     * @public
     * @generator
     */
    *write(data, date) {
        let fileName;
        
        if (date && moment(date).isValid()) {
            fileName = moment(date).format(DATE_FORMAT);
        } else {
            fileName = moment().format(DATE_FORMAT);
        }
        
        yield mkdirp(this._path);
        
        yield pfs.writeFile(path.join(this._path, fileName + '.json'), JSON.stringify(data, undefined, 4));
        
        /**
         * @event file-write
         * @param {json} data - The contents of the file.
         * @param {data} date - The date of the snapshot.
         */
        this.emit('file-write', data, date);
    }
}

exports = module.exports = FileStore;