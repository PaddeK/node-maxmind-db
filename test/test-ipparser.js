var IPParser = require('../lib/IPParser');
var scotchTape = require('scotch-tape');

function verify(t, ip) {
  t.doesNotThrow(function validate() {
    IPParser(ip);
  });
}

function verifyThrows(t, ip) {
  t.throws(function verify() {
    IPParser(ip);
  });
}

var ipParseTest = scotchTape();
ipParseTest('IPv4', function run(it) {
  it('should successfully parse correct formats', function should(t) {
    verify(t, '127:0:0:1');
    verify(t, '10:10:200:59');
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
    verify(t, '2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    verify(t, '2001:db8:85a3::8a2e:370:7334');
    t.end();
  });

  it('should throw exception on invalid ipv4 formats', function should(t) {
    verifyThrows(t, 'myipaddress');
    verifyThrows(t, '::ffff:192.0.2.128');
    t.end();
  });
});