'use strict';

var DATA_SECTION_SEPARATOR_SIZE = 16,
    METADATA_START_MARKER = new Buffer('ABCDEF4D61784D696E642E636F6D', 'hex'),
    fs = require('fs'),
    Metadata = require('./Metadata.js'),
    Decoder = require('./Decoder.js'),
    IPParser = require('./IPParser.js');

module.exports = Reader;

function Reader() {
}

Reader.open = function openAsync(database, callback) {
    var reader = new Reader();
    var start, metadataDecoder;
    fs.readFile(database, function db(err, data) {
        if (err) {
            return (callback && callback(err));
        }
        reader.fileHandle = data;
        start = reader.findMetadataStart(reader.fileHandle);
        metadataDecoder = new Decoder(reader.fileHandle, 0);
        metadataDecoder.decode(start, function decoded(err, metadata) {
            if (err) {
                return (callback && callback(err, null));
            }
            reader.metadata = new Metadata(metadata[0]);
            reader.decoder = new Decoder(reader.fileHandle, reader.metadata.getSearchTreeSize() + DATA_SECTION_SEPARATOR_SIZE);
            callback && callback(null, reader);
        });
    });
};

Reader.openSync = function openSync(database) {
    var reader = new Reader();
    var start, metadataDecoder, metadataArray;

    reader.fileHandle = fs.readFileSync(database);

    start = reader.findMetadataStart(reader.fileHandle);
    metadataDecoder = new Decoder(reader.fileHandle, 0);
    metadataArray = metadataDecoder.decodeSync(start);
    reader.metadata = new Metadata(metadataArray[0]);
    reader.decoder = new Decoder(reader.fileHandle, reader.metadata.getSearchTreeSize() + DATA_SECTION_SEPARATOR_SIZE);
    return reader;
};

Reader.prototype.findMetadataStart = function findMetadataStart(file) {
    var found = 0,
        mlen = METADATA_START_MARKER.length - 1,
        fsize = file.length - 1
        ;
    while (found <= mlen && fsize-- > 0) {
        found += (file[fsize] === METADATA_START_MARKER[mlen - found]) ? 1 : -found;
    }
    return fsize + found;
};

Reader.prototype.getSync = function getSync(ipAddress) {
    var pointer = this.findAddressInTree(ipAddress);
    return (pointer === 0) ? null : this.resolveDataPointerSync(pointer);
};

Reader.prototype.get = function get(ipAddress, callback) {
    var pointer = this.findAddressInTree(ipAddress);
    if (pointer === 0) {
        process.nextTick(function () {
            callback(null, null);
        });
    } else {
        this.resolveDataPointer(pointer, callback);
    }
};

Reader.prototype.findAddressInTree = function findAddressInTree(ipAddress) {
    var bit, tempBit, record,
        rawAddress = IPParser(ipAddress),
        countRaw = rawAddress.length,
        isIp4AddressInIp6Db = (countRaw === 4 && this.metadata.getIpVersion() === 6),
        ipStartBit = isIp4AddressInIp6Db ? 96 : 0,
        nodeNum = 0,
        i = 0,
        len = countRaw * 8 + ipStartBit
        ;

    for (i; i < len; i++) {
        bit = 0;

        if (i >= ipStartBit) {
            tempBit = 0xFF & rawAddress[parseInt((i - ipStartBit) / 8, 10)];
            bit = 1 & (tempBit >> 7 - (i % 8));
        }

        record = this.readNode(nodeNum, bit);

        if (record === this.metadata.getNodeCount()) {
            return 0;
        }

        if (record > this.metadata.getNodeCount()) {
            return record;
        }

        nodeNum = record;
    }

    return null;
};

Reader.prototype.readNode = function readNode(nodeNumber, index) {
    var bytes, middle,
        buffer = new Buffer(4),
        baseOffset = nodeNumber * this.metadata.getNodeByteSize()
        ;

    buffer.fill(0);

    switch (this.metadata.getRecordSize()) {
        case 24:
            bytes = baseOffset + index * 3;
            this.fileHandle.copy(buffer, 1, bytes, bytes + 3);
            return buffer.readUInt32BE(0, true);
        case 28:
            middle = this.fileHandle.readUInt8(baseOffset + 3, true);
            middle = (index === 0) ? (0xF0 & middle) >> 4 : 0x0F & middle;
            bytes = baseOffset + index * 4;
            this.fileHandle.copy(buffer, 1, bytes, bytes + 3);
            buffer.writeUInt8(middle, 0);
            return buffer.readUInt32BE(0, true);
        case 32:
            return this.fileHandle.readUInt32BE(baseOffset + index * 4, true);
        default:
            throw new Error("MaxmindDBReader: Unknown Recordsize in DB");
    }
};

Reader.prototype.resolveDataPointerSync = function resolveDataPointerSync(pointer) {
    var resolved = pointer - this.metadata.getNodeCount() + this.metadata.getSearchTreeSize();

    return this.decoder.decodeSync(resolved)[0];
};

Reader.prototype.resolveDataPointer = function resolveDataPointer(pointer, callback) {
    var resolved = pointer - this.metadata.getNodeCount() + this.metadata.getSearchTreeSize();

    this.decoder.decode(resolved, function (err, data) {
        if (err) return callback(err);
        callback(null, data[0]);
    });
};

Reader.prototype.getMetadata = function metadata() {
    return this.metadata;
};
