var IPParser = require('../lib/IPParser');
var scotchTape = require('scotch-tape');

function verify(t, ip, expected) {
  t.doesNotThrow(function validate() {
    IPParser(ip);
  });
  t.looseEquals(IPParser(ip), expected);
}

function verifyThrows(t, ip) {
  t.throws(function verify() {
    IPParser(ip);
  });
}

var ipParseTest = scotchTape();
ipParseTest('IPv4', function run(it) {
  it('should successfully parse correct formats', function should(t) {
    verify(t, '127.0.0.1', new Buffer([0x7f, 0x00, 0x00, 0x01]));
    verify(t, '10.10.200.59', new Buffer([0x0a, 0x0a, 0xc8, 0x3b]));
    t.end();
  });

  it('should throw exception on invalid ipv4 formats', function should(t) {
    verifyThrows(t, '127.0.0.a');
    verifyThrows(t, 'myipaddress');
    t.end();
  });
});

ipParseTest('IPv6', function run(it) {
  it('should successfully parse correct formats', function should(t) {
    verify(t, '2001:0db8:85a3:0000:0000:8a2e:0370:7334', new Buffer([0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34]));
    verify(t, '2001:db8:85a3::8a2e:370:7334', new Buffer([0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34]));
    t.end();
  });

  it('should throw exception on invalid ipv4 formats', function should(t) {
    verifyThrows(t, 'myipaddress');
    verifyThrows(t, '::ffff:192.0.2.128');
    t.end();
  });
});