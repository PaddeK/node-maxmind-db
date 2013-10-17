'use strict';

var Reader = require('./lib/Reader.js'),
    MaxmindDBReader;

MaxmindDBReader = module.exports = function (database) {
    if (database === undefined) {
        throw new Error('MaxmindDBReader: No Database given');
    }

    this.reader = new Reader(database);
};

MaxmindDBReader.prototype.getGeoData = function getGeoData(ipAddress) {
    return this.reader.get(ipAddress);
};

MaxmindDBReader.prototype.getDatabaseMetadata = function getDatabaseMetadata() {
    return this.reader.getMetadata();
};