var ipp = module.exports = function(ip){
	if(ip.indexOf('.')!==-1){
		return ipp.parseIPv4(ip);
	}else{
		return ipp.parseIPv6(ip);
	}
};

ipp.invalidIPv4 = /[^0-9\.]/i
ipp.parseIPv4 = function(ipstr){
	if(ipp.invalidIPv4.test(ipstr)){
		throw new Error("Invalid IPv4 address");
	}
	var arr = new Buffer(4);
	arr.fill(0);
	ipstr.split('.').forEach(function(nr,i){
		arr[i] = parseInt(nr);
	});
	return arr;
};

var repeat = function(c,l){
	var str="",i=0;
	while(i++ < l)str+=c;
	return str;
}
ipp.invalidIPv6 = /[^0-9a-f\:]/i;
ipp.parseIPv6 = function(ipstr){
	if(ipp.invalidIPv6.test(ipstr)){
		throw new Error("Invalid IPv6 address");
	}
	var arr = new Buffer(16);
	arr.fill(0);
	var l = ipstr.split(':').length;
	if(l < 8) ipstr = ipstr.replace('::',repeat(':',10 - l));
	ipstr.split(':').forEach(function(hex,i){
		if(hex=="")return;
		if(hex.length < 4){
			hex = repeat('0',4 - hex.length) + hex;
		}
		arr.write(hex,i*2,'hex');
	});
	return arr;
};
