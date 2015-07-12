'use strict';

module.exports = IPParser;

function IPParser(ip) {
  if (ip.indexOf('.') !== -1) {
    return IPParser.parseIPv4(ip);
  } else {
    return IPParser.parseIPv6(ip);
  }
}

IPParser.invalidIPv4 = /[^0-9\.]/i;
IPParser.parseIPv4 = function parseIPv4(ipstr) {
  if (IPParser.invalidIPv4.test(ipstr)) {
    throw new Error("Invalid IPv4 address");
  }
  var arr = new Buffer(4);
  arr.fill(0);
  ipstr.split('.').forEach(function part(nr, i) {
    arr[i] = parseInt(nr);
  });
  return arr;
};

IPParser.invalidIPv6 = /[^0-9a-f\:]/i;
IPParser.parseIPv6 = function parseIPv6(ipstr) {
  if (IPParser.invalidIPv6.test(ipstr)) {
    throw new Error("Invalid IPv6 address");
  }
  var arr = new Buffer(16);
  arr.fill(0);
  var l = ipstr.split(':').length;
  if (l < 8) ipstr = ipstr.replace('::', repeat(':', 10 - l));
  ipstr.split(':').forEach(function (hex, i) {
    if (hex == "")return;
    if (hex.length < 4) {
      hex = repeat('0', 4 - hex.length) + hex;
    }
    arr.write(hex, i * 2, 'hex');
  });
  return arr;
};

var repeat = function repeat(c, l) {
  var str = "", i = 0;
  while (i++ < l)str += c;
  return str;
};
