'use strict';

var IPv6 = require('ip-address').Address6;
var IPv4 = require('ip-address').Address4;

exports.parseIPv4 = function parseIPv4(ip) {
    var v4Address = new IPv4(ip);
    if (!v4Address.isValid()) {
        throw new Error("Invalid IPv4 address");
    }
    return v4Address.parsedAddress;
};

exports.parseIPv6 = function parseIPv6(ip) {
    var v6Address = new IPv6(ip);
    if (!v6Address.isValid()) {
        throw new Error("Invalid IPv6 address");
    }
    return v6Address.parsedAddress;
};
