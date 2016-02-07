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
    
    *readAll() {
        const data = [];

        yield mkdirp(this._path);
        
        const files = yield fs.readdir(this._path);
        
        for (const fileName of files) {
            const stats = yield fs.stat(this._path);
            
            if(!stats.isFile()) continue;
            
            data.push({
                timeStamp: moment(fileName, DATE_FORMAT).toDate(),
                data: require(this._path + '\\' + fileName)
            });
        }
        
        return data;
    }
    
    read() {
        
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