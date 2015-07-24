var mmdbreader = require('../index');
var path = require('path');
var scotchTape = require('scotch-tape');

var corruptDBPath = path.join(__dirname, './data/GeoLite2-City-Zero.mmdb');
var geoDBPath = path.join(__dirname, './data/GeoLite2-City.mmdb');
var ipData = [
    {ip: '8.8.8.8', country: 'US'},
    {ip: '2600:1010:b00e:4658:488b:55d4:86a4:3c61', country: 'US'},
    {ip: '141.136.120.166', country: 'NL'}
];

var runTests = scotchTape();
runTests('Maxmind DB Reader > Sync', function run(it) {
    it('should successfully handle database', function should(t) {
        var geoIp = mmdbreader.openSync(geoDBPath);
        t.ok(geoIp);
        t.end();
    });

    it('should fetch geo ip', function should(t) {
        var geoIp = mmdbreader.openSync(geoDBPath);
        ipData.forEach(function verify(data) {
            var geo = geoIp.getGeoDataSync(data.ip);
            t.equal(geo.country.iso_code, data.country, 'successfully geocoded ' + data.ip);
        });
        t.end();
    });

    it('should handle corrupt database', function should(t) {
        t.throws(function verify() {
            mmdbreader.openSync(corruptDBPath);
        });
        t.end();
    });
});

runTests('Maxmind DB Reader > Async', function run(it) {
    it('should successfully handle database', function should(t) {
        mmdbreader.open(geoDBPath, function open(err, geoIp) {
            t.ok(geoIp);
            t.notOk(err);
            t.end();
        });
    });

    it('should fetch geo ip', function should(t) {
        mmdbreader.open(geoDBPath, function open(err, geoIp) {
            var len = ipData.length;
            var num = 0;
            ipData.forEach(function verify(data) {
                var geo = geoIp.getGeoData(data.ip, function (err, geo) {
                    t.notOk(err);
                    t.ok(geo);
                    t.equal(geo.country.iso_code, data.country, 'successfully geocoded ' + data.ip);
                    num++;
                    if (len === num) {
                        t.end();
                    }
                });
            });
        });
    });

    it('should handle corrupt database', function should(t) {
        mmdbreader.open(corruptDBPath, function open(err, geoIp) {
            t.ok(err);
            t.notOk(geoIp);
            t.end();
        });
    });
});
