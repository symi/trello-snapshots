const promisify = require('promisify-node'),
    mkdirp = promisify('mkdrip'),
    fs = promisify('fs'),
    moment = require('moment'),
    path = require('path'),
    DATE_FORMAT = 'YYYY-MM-DD_HH_mm_ss';

class FileStore {
    constructor(path) {
        this._path = path;
    }
    
    *_getFileNames() {
        const fileNames = [];

        yield mkdirp(this._path);
        
        const files = yield fs.readdir(this._path);
        
        for (const fileName of files) {
            const stats = yield fs.stat(this._path);
            
            if(!stats.isFile()) continue;
            
            fileNames.push(fileName)
        }
        
        return fileNames;
    }
    
    _getData(fileName) {
        return {
            timestamp: moment(fileName, DATE_FORMAT).toDate(),
            data: require(this._path + '\\' + fileName)
        };
    }  
        
    _orderFileNames(fileNames) {
        return fileNames
            .map(fileName => {
                return { 
                    timestamp: this._getTimestamp(fileName), 
                    name: fileName
                };
            })
            .sort((a, b) => a.timestamp > b.timestamp);
    }
    
    *readAll() {
        const fileNames = yield* this._getFileNames(),
            data = [];      
        
        for (const fileName of fileNames) {
            data.push(this._getData(fileName));
        }
        
        return data;
    }
    
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
        
        const start = date1,
            end = date2,
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
    
    *readLatest() {
        const fileNames = this._orderFileNames(yield* this._getFileNames());            
        return this._getData(fileNames[fileNames.length - 1].name);
    }
    
    *write(data, date) {
        let fileName;
        
        if (date && moment(date).isValid()) {
            fileName = moment(date).format(DATE_FORMAT);
        } else {
            fileName = moment().format(DATE_FORMAT);
        }
        
        yield fs.writeFile(path.join(this._path, fileName, '.json'), JSON.stringify(data, undefined, 4));
    }
}

exports = module.exports = FileStore;