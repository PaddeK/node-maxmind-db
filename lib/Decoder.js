'use strict';

var bigInt = require('big-integer');

module.exports = Decoder;

function Decoder(fileStream, pointerBase) {
    this.fileStream = fileStream;
    this.pointerBase = pointerBase || 0;
    this.types = [
        'extended',         //  0
        'pointer',          //  1
        'utf8_string',      //  2
        'double',           //  3
        'bytes',            //  4
        'uint16',           //  5
        'uint32',           //  6
        'map',              //  7
        'int32',            //  8
        'uint64',           //  9
        'uint128',          // 10
        'array',            // 11
        'container',        // 12
        'end_marker',       // 13
        'boolean',          // 14
        'float'             // 15
    ];
    this.pointerValueOffset = [0, 0, 2048, 526336, 0];
}

Decoder.prototype.decode = function decode(offset, callback, nexttick) {
    var tmp,
        that = this,
        ctrlByte = this.fileStream[offset++],
        type = this.types[ctrlByte >> 5]
        ;

    if (type === 'pointer') {
        tmp = this.decodePointer(ctrlByte, offset);
        this.decode(tmp[0], function (err, data) {
            if (err) return callback(err);
            callback(null, [data[0], tmp[1]]);
        }, nexttick);
        return;
    }

    if (type === 'extended') {
        tmp = this.fileStream[offset] + 7;

        if (tmp < 8) {
            return callback(new Error('MaxmindDBReader: Invalid Extended Type at offset:' + offset));
        }

        type = this.types[tmp];
        offset++;
    }

    tmp = this.sizeFromCtrlByte(ctrlByte, offset);
    if (nexttick === false)
        this.decodeByType(type, tmp[1], tmp[0], callback);
    else
        process.nextTick(function () {
            that.decodeByType(type, tmp[1], tmp[0], callback);
        });
};

Decoder.prototype.decodeByType = function decodeByType(type, offset, size, callback) {
    var newOffset = offset + size,
        bytes = this.read(offset, size)
        ;

    switch (type) {
        case 'map':
            return this.decodeMap(size, offset, callback);
        case 'array':
            return this.decodeArray(size, offset, callback);
        case 'boolean':
            return callback(null, [this.decodeBoolean(size), offset]);
        case 'utf8_string':
            return callback(null, [this.decodeString(bytes), newOffset]);
        case 'double':
            return callback(null, [this.decodeDouble(bytes), newOffset]);
        case 'float':
            return callback(null, [this.decodeFloat(bytes), newOffset]);
        case 'bytes':
            return callback(null, [bytes, newOffset]);
        case 'uint16':
            return callback(null, [this.decodeUint16(bytes), newOffset]);
        case 'uint32':
            return callback(null, [this.decodeUint32(bytes), newOffset]);
        case 'int32':
            return callback(null, [this.decodeInt32(bytes), newOffset]);
        case 'uint64':
            return callback(null, [this.decodeUint64(bytes), newOffset]);
        case 'uint128':
            return callback(null, [this.decodeUint128(bytes), newOffset]);
    }
    callback(new Error("MaxmindDBReader: Unknown or unexpected type: " + type + ' at offset:' + offset));
};

Decoder.prototype.decodeSync = function decodeSync(offset) {
    var tmp,
        ctrlByte = this.fileStream[offset++],
        type = this.types[ctrlByte >> 5]
        ;

    if (type === 'pointer') {
        tmp = this.decodePointer(ctrlByte, offset);
        return [this.decodeSync(tmp[0])[0], tmp[1]];
    }

    if (type === 'extended') {
        tmp = this.fileStream[offset] + 7;

        if (tmp < 8) {
            throw new Error('MaxmindDBReader: Invalid Extended Type at offset:' + offset);
        }

        type = this.types[tmp];
        offset++;
    }

    tmp = this.sizeFromCtrlByte(ctrlByte, offset);

    return this.decodeByTypeSync(type, tmp[1], tmp[0]);
};

Decoder.prototype.decodeByTypeSync = function decodeByTypeSync(type, offset, size) {
    var newOffset = offset + size,
        bytes = this.read(offset, size)
        ;

    switch (type) {
        case 'map':
            return this.decodeMapSync(size, offset);
        case 'array':
            return this.decodeArraySync(size, offset);
        case 'boolean':
            return [this.decodeBoolean(size), offset];
        case 'utf8_string':
            return [this.decodeString(bytes), newOffset];
        case 'double':
            return [this.decodeDouble(bytes), newOffset];
        case 'float':
            return [this.decodeFloat(bytes), newOffset];
        case 'bytes':
            return [bytes, newOffset];
        case 'uint16':
            return [this.decodeUint16(bytes), newOffset];
        case 'uint32':
            return [this.decodeUint32(bytes), newOffset];
        case 'int32':
            return [this.decodeInt32(bytes), newOffset];
        case 'uint64':
            return [this.decodeUint64(bytes), newOffset];
        case 'uint128':
            return [this.decodeUint128(bytes), newOffset];
        default:
            throw new Error("MaxmindDBReader: Unknown or unexpected type: " + type + ' at offset:' + offset);
    }
};

Decoder.prototype.read = function read(offset, numberOfBytes) {
    var buf;

    if (numberOfBytes === 0) {
        return new Buffer(0);
    }

    if (numberOfBytes === 1) {
        return new Buffer([this.fileStream[offset]]);
    }

    buf = new Buffer(numberOfBytes);
    buf.fill(0);

    this.fileStream.copy(buf, 0, offset, offset + numberOfBytes);

    return buf;
};

Decoder.prototype.sizeFromCtrlByte = function sizeFromCtrlByte(ctrlByte, offset) {
    var size = ctrlByte & 0x1f,
        bytesToRead = size < 29 ? 0 : size - 28,
        bytes = this.read(offset, bytesToRead),
        decoded = this.decodeUint32(bytes)
        ;

    if (size === 29) {
        size = 29 + decoded;
    } else if (size === 30) {
        size = 285 + decoded;
    } else if (size > 30) {
        size = (decoded & (0x0FFFFFFF >> (32 - (8 * bytesToRead)))) + 65821;
    }

    return [size, offset + bytesToRead];
};

Decoder.prototype.decodePointer = function decodePointer(ctrlByte, offset) {
    var packed, pointer,
        pointerSize = ((ctrlByte >> 3) & 0x3) + 1,
        buffer = this.read(offset, pointerSize)
        ;

    offset += pointerSize;

    packed = (pointerSize === 4) ? buffer : Buffer.concat([new Buffer([ctrlByte & 0x7]), buffer], buffer.length + 1);

    pointer = this.decodeUint32(packed) + this.pointerBase + this.pointerValueOffset[pointerSize];

    return [pointer, offset];
};

Decoder.prototype.decodeArray = function decodeArray(size, offset, callback) {
    var that = this;
    process.nextTick(function () {
        var tmp,
            i = 1,
            array = [],
            cb = function (err, tmp) {
                if (err) {
                    return callback(err);
                }
                offset = tmp[1];
                array.push(tmp[0]);
                if (i++ < size) {
                    that.decode(offset, cb, i % 20 === 0);
                } else {
                    callback(null, [array, offset]);
                }
            };
        if (size === 0) callback(null, [[], offset]);
        that.decode(offset, cb, false);
    });
};

Decoder.prototype.decodeArraySync = function decodeArraySync(size, offset) {
    var tmp,
        i = 0,
        array = []
        ;

    for (i; i < size; i++) {
        tmp = this.decodeSync(offset);
        offset = tmp[1];
        array.push(tmp[0]);
    }

    return [array, offset];
};

Decoder.prototype.decodeBoolean = function decodeBoolean(size) {
    return (size !== 0);
};

Decoder.prototype.decodeDouble = function decodeDouble(bits) {
    return bits.readDoubleBE(0, true);
};

Decoder.prototype.decodeFloat = function decodeFloat(bits) {
    return bits.readFloatBE(0, true);
};

Decoder.prototype.decodeMap = function decodeMap(size, offset, callback) {
    var that = this;
    process.nextTick(function () {
        var tmp, key,
            map = {},
            i = 1,
            cb = function (err, tmp) {
                if (err) {
                    return callback(err);
                }
                map[key] = tmp[0];
                offset = tmp[1];
                if (i++ < size) {
                    tmp = that.decodeSync(offset);
                    key = tmp[0].toString();
                    that.decode(tmp[1], cb, i % 20 === 0);
                } else {
                    callback(null, [map, offset]);
                }
            };
        if (size === 0) return callback(null, [{}, offset]);
        tmp = that.decodeSync(offset);
        key = tmp[0].toString();
        that.decode(tmp[1], cb, false);
    });
};

Decoder.prototype.decodeMapSync = function decodeMapSync(size, offset) {
    var tmp, key,
        map = {},
        i = 0
        ;

    for (i; i < size; i++) {
        tmp = this.decodeSync(offset);
        key = tmp[0].toString();
        tmp = this.decodeSync(tmp[1]);
        offset = tmp[1];
        map[key] = tmp[0];
    }

    return [map, offset];
};

Decoder.prototype.decodeUint16 = function decodeUint16(bytes) {
    return this.decodeUint32(bytes);
};

Decoder.prototype.decodeInt32 = function decodeInt32(bytes) {
    return bytes.readInt32BE(0, true);
};

Decoder.prototype.decodeUint32 = function decodeUint32(bytes) {
    var buffer = new Buffer(4);

    buffer.fill(0);
    bytes.copy(buffer, 4 - bytes.length);

    return buffer.readUInt32BE(0, true);
};

Decoder.prototype.decodeUint64 = function decodeUint64(bytes) {
    return this.decodeBigUint(bytes, 8);
};

Decoder.prototype.decodeUint128 = function decodeUint128(bytes) {
    return this.decodeBigUint(bytes, 16);
};

Decoder.prototype.decodeBigUint = function decodeBigUint(bytes, size) {
    var buffer,
        i = 0,
        integer = 0,
        numberOfLongs = size / 4
        ;

    buffer = new Buffer(size);
    buffer.fill(0);
    bytes.copy(buffer, size - bytes.length);

    for (i; i < numberOfLongs; i++) {
        integer = bigInt(integer).multiply(4294967296).add(buffer.readUInt32BE(i << 2, true));
    }

    return integer.toString();
};

Decoder.prototype.decodeString = function decodeString(bytes) {
    return bytes.toString('utf8');
};
