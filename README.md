# node-maxmind-db

This is the pure Node API for reading MaxMind DB files. MaxMind DB is a binary file format that stores data indexed by IP address subnets (IPv4 or IPv6).

# WARNING

* `.open(Sync)` needs to be called once before abusing `.getGeoData(Sync)`
* this is version 0.1.0! the API is not compitable with 0.0.*
* Most IP's don't seem to have city data in the GeoLite2 City database. Only american cities are present, if your IP is american but not returning a city try to replace the last number of your IP by a 0 (only with a IPv4 address. for IPv6 address it doesn't seem to work).

# Install

    npm i maxmind-db-reader

# Example


## Async
```javascript
// require the db reader
var mmdbreader = require('maxmind-db-reader');
// open database
mmdbreader.open('./countries.mmdb',function(err,countries){
    // get geodata
    countries.getGeoData('128.101.101.101',function(err,geodata){
        // log data :D
        console.log(geodata);
    });
});
```

## Sync
```javascript
// require the db reader
var mmdbreader = require('maxmind-db-reader');
//  open database
var countries = mmdbreader.openSync('./countries.mmdb');
// get geodata
var geodata = countries.getGeoDataSync('128.101.101.101');
// log data :D
console.log(geodata);
```

## Mixed (Sync init, Async request)

```javascript
// require the db reader
var mmdbreader = require('maxmind-db-reader');
// open database
var countries = mmdbreader.openSync('./countries.mmdb');
// get geodata
countries.getGeoData('128.101.101.101',function(err,geodata){
    // log data :D
    console.log(geodata);
});
```

## Result
```javascript
{
    "city": {
        "geoname_id": 5037649,
        "names": {
            "de": "Minneapolis",
            "en": "Minneapolis",
            "es": "Mineápolis",
            "fr": "Minneapolis",
            "ja": "ミネアポリス",
            "pt-BR": "Minneapolis",
            "ru": "Миннеаполис",
            "zh-CN": "明尼阿波利斯"
        }
    },
    "continent": {
        "code": "NA",
        "geoname_id": 6255149,
        "names": {
            "de": "Nordamerika",
            "en": "North America",
            "es": "Norteamérica",
            "fr": "Amérique du Nord",
            "ja": "北アメリカ",
            "pt-BR": "América do Norte",
            "ru": "Северная Америка",
            "zh-CN": "北美洲"
        }
    },
    "country": {
        "geoname_id": 6252001,
        "iso_code": "US",
        "names": {
            "de": "USA",
            "en": "United States",
            "es": "Estados Unidos",
            "fr": "États-Unis",
            "ja": "アメリカ合衆国",
            "pt-BR": "Estados Unidos",
            "ru": "США",
            "zh-CN": "美国"
        }
    },
    "location": {
        "latitude": 44.9759,
        "longitude": -93.2166,
        "metro_code": "613",
        "time_zone": "America/Chicago"
    },
    "postal": {
        "code": "55414"
    },
    "registered_country": {
        "geoname_id": 6252001,
        "iso_code": "US",
        "names": {
            "de": "USA",
            "en": "United States",
            "es": "Estados Unidos",
            "fr": "États-Unis",
            "ja": "アメリカ合衆国",
            "pt-BR": "Estados Unidos",
            "ru": "США",
            "zh-CN": "美国"
        }
    },
    "subdivisions": [
        {
            "geoname_id": 5037779,
            "iso_code": "MN",
            "names": {
                "en": "Minnesota",
                "es": "Minnesota",
                "ja": "ミネソタ州",
                "ru": "Миннесота"
            }
        }
    ]
}
```

# API

`maxmind-db-reader`
 * `.open (databasePath, callback(err, maxmind-db-reader)) void`
 * `.openSync (databasePath) maxmind-db-reader`

`maxmind-db-reader()`
 * `.getGeoData (ip, callback(err,geodata)) void`
 * `.getGeoDataSync (ip) geodata`
 * `.getDatabaseMetadata() metadata`
