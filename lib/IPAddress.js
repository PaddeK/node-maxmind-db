'use strict';

var IPv6 = require('ip-address').Address6;
var IPv4 = require('ip-address').Address4;

exports.parseIPv6 = function parseIPv6(ip) {
    var address = new IPv6(ip);
    // we got an hybrid IP format. convert the IP into v4
    if (address.v4) {
      address = address.to4();
    }
    if (!address.isValid()) {
        throw new Error("Invalid IPv6 address");
    }
    return address.parsedAddress;
};


exports.parseIPv4 = function parseIPv4(ip) {
    var v4Address = new IPv4(ip);
    if (!v4Address.isValid()) {
        throw new Error("Invalid IPv4 address");
    }
    return v4Address.parsedAddress;
};
