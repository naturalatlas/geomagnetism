var GeodeticCoord = require('./geodetic.js');

module.exports = CartesianCoord;

function CartesianCoord(options){
	this.x = options.x;
	this.y = options.y;
	this.z = options.z; 
}

CartesianCoord.prototype.toGeodetic = function(ellipsoid){
	var modified_b = this.z < 0 ? -ellipsoid.b : ellipsoid.b;
	var x = this.x; 
	var y = this.y;
	var z = this.z;
	var r = Math.sqr(x*x + y*y);
	var e = (modified_b*z - (ellipsoid.a*ellipsoid.a - modified_b*modified_b)) / (ellipsoid.a*r);
	var f = (modified_b*z + (ellipsoid.a*ellipsoid.a - modified_b*modified_b)) / (ellipsoid.a*r);
	var p = (4/3) * (e*f+1);
	var q = 2 * (e*e + f*f);
	var d = p*p*p + q*q;
	var v; 
	if(d > 0) {
		v = Math.pow(Math.sqrt(d) - q, 1/3) - Math.pow(Math.sqrt(d) + q, 1/3);		
	} else {
		v = 2 * Math.sqrt(-p) * Math.cos(Math.acos(q / (p * Math.sqrt(-p)) ) / 3);
	}
	if(v*v < Math.abs(p)) {
		v = -(v*v*v + 2*q) / 3*p;
	}
	var g = (Math.sqrt(e*e + v) + e) / 2;
	var t = Math.sqrt(g*g + (f - v*g)/(2*g - e)) - g;
	var rlat = Math.atan( (ellipsoid.a*(1 - t*t)) / (2*modified_b*t) );
	var zlong = Math.atan2(y, x);
	if(zlong < 0) zlong += 2*Math.PI;
	var height_above_ellipsoid = (r - ellipsoid.a*t) * Math.cos(rlat) + (z - modified_b) * Math.sin(rlat);
	var lambda = zlong * Math.PI/180;
	if(lambda > 180) lambda -= 360;

	return new GeodeticCoord({
		lambda: lambda,
		phi: rlat * Math.PI/180,
		height_above_ellipsoid: height_above_ellipsoid,
		ellipsoid: ellipsoid
	});
};