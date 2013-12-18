var mmdbreader = require('../index');
//  create new reader from a countries file
var countries = mmdbreader('./geo.mmdb');
// get geo data and console.log it 
var data = {
	'8.8.8.8':'US',
	'2600:1010:b00e:4658:488b:55d4:86a4:3c61':'US'
};

for(var ip in data){
	var data;
	if(data=countries.getGeoData(ip)){
		if(data.country.iso_code){
			console.log(ip + ' passed')
		}else{
			console.log(ip + ' failed')
		}
	}else{
		console.log(ip + ' failed')
	}
}