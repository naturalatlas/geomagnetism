var CartesianCoord = require('./cartesian.js');
var LegendreFunction = require('../legendre.js');

module.exports = SphericalCoord;

function SphericalCoord(options){
	this.lambda = options.lambda; // longitude
	this.phig = options.phig; // geocentric latitude
	this.r = options.r; // distance from center of ellipsoid
}

SphericalCoord.prototype.toCartesian = function(){
	var radphi = this.phig * Math.PI/180;
	var radlambda = this.lambda * Math.PI/180;
	return new CartesianCoord({
		x: this.r * cos(radphi) * cos(radlambda),
		y: this.r * cos(radphi) * sin(radlambda),
		z: this.r * sin(radphi)
	});
};

SphericalCoord.prototype.toGeodetic = function(ellipsoid){
	return this.toCartesian().toGeodetic(ellipsoid);
};

SphericalCoord.prototype.getHarmonicVariables = function(ellipsoid, n_max){
	var m, n;
	var cos_lambda = Math.cos(Math.PI/180 * this.lambda);
	var sin_lambda = Math.sin(Math.PI/180 * this.lambda);

	var cos_mlambda = [1.0, cos_lambda];
	var sin_mlambda = [0.0, sin_lambda];
	var relative_radius_power = [
		(ellipsoid.re/this.r) * (ellipsoid.re/this.r)
	];

	for(n = 1; n <= n_max; n++){
		relative_radius_power[n] = relative_radius_power[n-1] * (ellipsoid.re/this.r);
	}
	for(m = 2; m <= n_max; m++){
		cos_mlambda[m] = cos_mlambda[m-1]*cos_lambda - sin_mlambda[m-1]*sin_lambda;
		sin_mlambda[m] = cos_mlambda[m-1]*sin_lambda + sin_mlambda[m-1]*cos_lambda;
	}

	return {
		relative_radius_power: relative_radius_power,
		cos_mlambda: cos_mlambda,
		sin_mlambda: sin_mlambda
	};
};

SphericalCoord.prototype.getLegendreFunction = function(n_max) {
	return new LegendreFunction(this, n_max);
};