var geomagnetism = require('../index.js');
var assert = require('chai').assert;
var fs = require('fs');

var tolerances = {
	incl: 0.01, //deg
	decl: 0.01, //deg
	x: 5, //nT
	y: 5, //nT
	z: 5, //nT
	h: 5, //nT
	f: 5 //nT
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
	describe("point()", function(){
		it("should return expected values", function(){
			values.forEach(function(test){
				var model = getModel(test);
				var info = model.point([test.lat, test.lon, test.alt]);
				assert.closeTo(info.incl, test.incl, tolerances.incl, 'inclination ' + test.date);
				assert.closeTo(info.decl, test.decl, tolerances.decl, 'declination ' + test.date);
				assert.closeTo(info.x, test.x, tolerances.x, 'x');
				assert.closeTo(info.y, test.y, tolerances.y, 'y');
				assert.closeTo(info.z, test.z, tolerances.z, 'z');
				assert.closeTo(info.h, test.h, tolerances.h, 'h');
				assert.closeTo(info.f, test.f, tolerances.f, 'f');
			});
		});
		it("should return value for current date", function(){
			var date = new Date();
			geomagnetism.model(date).point([44.53461, -109.05572]);
		});
		it("should return value for current date + 1 year", function(){
			var date = new Date();
			date.setFullYear(date.getFullYear() + 1);
			geomagnetism.model(date).point([44.53461, -109.05572]);
		});
	});
	describe("getTimedModel()", function(){
		it("should throw error if date is outside of valid range and allowOutOfBoundsModel is false", function(){
			assert.throws(function(){
				geomagnetism.model(new Date("1/1/1999"));
			}, Error);
		});
		it("should log error if date is outside of valid range below and allowOutOfBoundsModel is true", function(){
			var model = geomagnetism.model(new Date("1/1/1999"), { allowOutOfBoundsModel: true });
			assert.equal(model.start_date.getFullYear(), 2014);
		});
		it("should log error if date is outside of valid range above and allowOutOfBoundsModel is true", function(){
			var model = geomagnetism.model(new Date("1/1/2030"), { allowOutOfBoundsModel: true });
			assert.equal(model.start_date.getFullYear(), 2024);
		});
		it("should get a different model for a different date", function(){
			var pt = [44.53461, -109.05572];
			var model0 = geomagnetism.model();
			var model1 = geomagnetism.model(new Date("3/22/2018"));
			var decl0 = model0.point(pt).decl;
			var decl1 = model1.point(pt).decl;
			assert.notEqual(model0, model1);
			assert(Math.abs(decl1 - decl0) > 0.001, 'declination should be different');
		});

	});
});
