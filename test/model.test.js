var geomagnetism = require('../index.js');
var assert = require('chai').assert;
var path = require('path');
var fs = require('fs');

var tolerances = {
	incl: 1, //deg
	decl: 2, //deg
	x: 250, //nT
	y: 250, //nT
	z: 250, //nT
	h: 250, //nT
	f: 250 //nT
};

function loadTestValues(){
	var str = fs.readFileSync(__dirname + '/values.csv', {encoding: 'utf8'});
	var lines = str.split(/\r?\n/);
	var header = lines[0].split(',');
	var values = [];
	for(var i = 1; i < lines.length; i++){
		var l = lines[i].split(',');
		var v = {};
		for(var j = 0; j < header.length; j++){
			v[header[j]] = parseFloat(l[j]);
		}
		values.push(v);
	}
	return values;
}

function getModel(test){
	var t0, t1;
	var year = test.date;
	var year_int = Math.floor(year);
	var year_fpart = year - year_int;
	var dms = 1000*3600*24*365*year_fpart;

	t0 = new Date(year_int, 0, 1);
	t1 = new Date(t0.valueOf() + dms);

	return geomagnetism.model(t1);
}

var values = loadTestValues();

describe("model", function(){
	it("should return expected values", function(){
		values.forEach(function(test){
			if(test.alt > 0) return;
			var model = getModel(test);
			var info = model.point([test.lat, test.lon]);
			assert.closeTo(info.incl, test.incl, tolerances.incl, 'inclination');
			assert.closeTo(info.decl, test.decl, tolerances.decl, 'declination');
			assert.closeTo(info.x, test.x, tolerances.x, 'x');
			assert.closeTo(info.y, test.y, tolerances.y, 'y');
			assert.closeTo(info.z, test.z, tolerances.z, 'z');
			assert.closeTo(info.h, test.h, tolerances.h, 'h');
			assert.closeTo(info.f, test.f, tolerances.f, 'f');
		});
	});
});
