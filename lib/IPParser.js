'use strict';

var IPv6 = require('ip-address').v6;
var IPv4 = require('ip-address').v4;

module.exports = IPParser;

function IPParser(ip) {
  if (ip.indexOf('.') !== -1) {
    return IPParser.parseIPv4(ip);
  } else {
    return IPParser.parseIPv6(ip);
  }
}

IPParser.parseIPv4 = function parseIPv4(ip) {
  var v4Address = new IPv4.Address(ip)
  if(!v4Address.isValid()) {
    throw new Error("Invalid IPv4 address");
  }
  return(ipv4Buffer(v4Address.parsedAddress));
};

IPParser.parseIPv6 = function parseIPv6(ip) {
  var v6Address = new IPv6.Address(ip);
  if(!v6Address.isValid()) {
    throw new Error("Invalid IPv6 address");
  }
  return(ipv6Buffer(v6Address.parsedAddress));
};


function ipv4Buffer(groups) {
  var arr = new Buffer(4);
  arr.fill(0);
  groups.forEach(function part(nr, i) {
    arr[i] = parseInt(nr);
  });
  return arr;
}

function ipv6Buffer(groups) {
  var arr = new Buffer(16);
  arr.fill(0);
  groups.forEach(function part(hex, i) {
    if (hex == "") return;
    if (hex.length < 4) {
      hex = repeat('0', 4 - hex.length) + hex;
    }
    arr.write(hex, i * 2, 'hex');
  });
  return arr;
}

function repeat(c, l) {
  var str = "", i = 0;
  while (i++ < l)str += c;
  return str;
}
