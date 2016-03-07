'use strict';
const FileStore = require('../src/FileStore'),
    del = require('del'),
    co = require('co'),
    date1 = new Date(new Date() - 1000),
    date2 = new Date(new Date() - 2000),
    date3 = new Date(new Date() - 3000),
    date4 = new Date(new Date() - 4000);

function *populateFileStore() {
    yield* this.fileStore.write({test:'data1'}, date1);
}


describe('FileStore', () => {
    beforeEach(() => {
        this.path = './test-data-files';
        this.fileStore = new FileStore(this.path);
    });
    
    afterEach(done => {
        del([this.path + '/**'])
            .then(() => {
                this.path = undefined;
                this.path = this.fileStore = undefined;
                done();
            });  
    });    
        
    describe('readAll', () => {
        it('should return all files in the file store',  () => {
            expect(FileStore).toBeDefined(); 
        });
    });
    
    describe('write', () => {
        
    });
});