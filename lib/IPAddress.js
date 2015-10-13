'use strict';

var IPv6 = require('ip-address').v6;
var IPv4 = require('ip-address').v4;

exports.parseIPv4 = function parseIPv4(ip) {
    var v4Address = new IPv4.Address(ip);
    if (!v4Address.isValid()) {
        throw new Error("Invalid IPv4 address");
    }
    return v4Address.parsedAddress;
};

exports.parseIPv6 = function parseIPv6(ip) {
    var v6Address = new IPv6.Address(ip);
    if (!v6Address.isValid()) {
        throw new Error("Invalid IPv6 address");
    }
    return v6Address.parsedAddress;
};

exports.parseIPv4_Mapped_IPv6 = function parseIPv4_Mapped_IPv6(ip){
    var v6Address = new IPv6.Address(ip);
    if (!v6Address.isValid() || !v6Address.is4()){
        throw new Error("Invalid IPv4-mapped IPv6 address");
    }
    return v6Address.tov4().parsedAddress
}
