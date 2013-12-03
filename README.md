node-maxmind-db
===============

This is the pure Node API for reading MaxMind DB files. MaxMind DB is a binary file format that stores data indexed by IP address subnets (IPv4 or IPv6).

Install
======

    npm i maxmind-db-reader
    
Example
=====
```javascript
// require the db reader
var mmdbreader = require('maxmind-db-reader');
//  create new reader from a countries file
var countries = new mmdbreader('./countries.mmdb');
// get geo data and console.log it 
console.log(countries.getGeoData('8.8.8.8'));
```
It will console log something like this
```javascript
{
    "continent": {
        "code": "NA",
        "geoname_id": 6255149,
        "names": {
            "de": "Nordamerika",
            "en": "North America",
            "es": "Norteamérica",
            "fr": "Amérique du Nord",
            "ja": "?????",
            "pt-BR": "América do Norte",
            "ru": "???????? ???????",
            "zh-CN": "???"
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
            "ja": "???????",
            "pt-BR": "Estados Unidos",
            "ru": "???",
            "zh-CN": "??"
        }
    },
    "location": {
        "latitude": 38,
        "longitude": -97
    },
    "registered_country": {
        "geoname_id": 6252001,
        "iso_code": "US",
        "names": {
            "de": "USA",
            "en": "United States",
            "es": "Estados Unidos",
            "fr": "États-Unis",
            "ja": "???????",
            "pt-BR": "Estados Unidos",
            "ru": "???",
            "zh-CN": "??"
        }
    }
}
```
