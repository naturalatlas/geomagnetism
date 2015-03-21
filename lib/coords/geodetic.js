var SphericalCoord = require('./spherical.js');
var Ellipsoid = require('../ellipsoid.js');

module.exports = GeodeticCoord;

function GeodeticCoord(options){
	this.options = options;
	this.lambda = options.lambda || options.lon; // longitude
	this.phi = options.phi || options.lat; // geodetic latitude
	this.height_above_ellipsoid = options.height_above_ellipsoid || 0;
	this.ellipsoid = options.ellipsoid || new Ellipsoid();
}

GeodeticCoord.prototype.toSpherical = function() {
	var ellipsoid = this.ellipsoid;
	var coslat = Math.cos(this.phi*Math.PI/180);
	var sinlat = Math.sin(this.phi*Math.PI/180);
	var rc = ellipsoid.a / Math.sqrt(1 - ellipsoid.epssq * sinlat * sinlat);
	var xp = (rc + this.height_above_ellipsoid) * coslat;
	var zp = (rc * (1 - ellipsoid.epssq) + this.height_above_ellipsoid) * sinlat;
	var r = Math.sqrt(xp*xp + zp*zp);
	return new SphericalCoord({
		r: r,
		phig: 180/Math.PI*Math.asin(zp / r),
		lambda: this.lambda
	});
};

GeodeticCoord.prototype.clone = function(){
	return new GeodeticCoord(this.options);
};