'use strict';

var DATA_SECTION_SEPARATOR_SIZE = 16,
    METADATA_START_MARKER       = new Buffer('ABCDEF4D61784D696E642E636F6D','hex'),
    fs                          = require('fs'),
    Metadata                    = require('./Metadata.js'),
    Decoder                     = require('./Decoder.js'),
    Reader;

Reader = module.exports = function (database) {
    var start, metadataDecoder, metadataArray;

    this.fileHandle = fs.readFileSync(database);

    start = this.findMetadataStart(this.fileHandle);
    metadataDecoder = new Decoder(this.fileHandle, 0);
    metadataArray = metadataDecoder.decode(start);

    this.metadata = new Metadata(metadataArray[0]);
    this.decoder  = new Decoder(this.fileHandle, this.metadata.getSearchTreeSize() + DATA_SECTION_SEPARATOR_SIZE);
};

Reader.prototype.findMetadataStart = function findMetadataStart(file) {
    var found = 0,
        mlen = METADATA_START_MARKER.length - 1,
        fsize = file.length - 1
    ;

    while (found <= mlen && fsize--) {
        found += (file[fsize] === METADATA_START_MARKER[mlen - found]) ? 1 : -found;
    }

    return fsize + found;
};

Reader.prototype.get = function get(ipAddress) {
    var pointer = this.findAddressInTree(ipAddress);

    return (pointer === 0) ? null : this.resolveDataPointer(pointer);
};

Reader.prototype.findAddressInTree = function findAddressInTree(ipAddress) {
    var bit, tempBit, record,
        rawAddress = ipAddress.split('.').map(function(v) { return parseInt(v, 10); }),
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

    throw new Error('MaxmindDBReader: Unable to find IP:' + ipAddress + ' in Database');
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
            return bytes.readUInt32BE(baseOffset + index * 4, true);
        default:
            throw new Error("MaxmindDBReader: Unknown Recordsize in DB");
    }
};

Reader.prototype.resolveDataPointer = function resolveDataPointer(pointer) {
    var resolved = pointer - this.metadata.getNodeCount() + this.metadata.getSearchTreeSize();

    return this.decoder.decode(resolved)[0];
};

Reader.prototype.getMetadata = function metadata() {
    return this.metadata;
};
