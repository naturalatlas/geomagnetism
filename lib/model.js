var path = require('path');

var GeodeticCoord = require('./coords/geodetic.js');
var Ellipsoid = require('./ellipsoid.js');
var MagneticElements = require('./magnetic_elements.js');

module.exports = Model;

function Model(options){
	options = options || {};
	this.epoch = options.epoch;
	this.start_date = options.start_date;
	this.end_date = options.end_date;
	this.name = options.name || "";
	this.main_field_coeff_g = [0];
	this.main_field_coeff_h = [0];
	this.secular_var_coeff_g = [0];
	this.secular_var_coeff_h = [0];
	this.n_max = 0;
	this.n_max_sec_var = 0;
	this.num_terms = 0;
}

Model.prototype.load = function(str){
	var lines = str.split('\n');
	var n = lines.length;
	for(var i = 0; i < n; i++) {
		var line = lines[i];
		var vals = line.split(' ');
		if(vals.length === 3){
			this.epoch = parseFloat(vals[0]);
			this.name = vals[1]; 
			this.start_date = new Date(vals[2]);
			this.end_date = new Date(vals[2]);
			var year = this.start_date.getFullYear();
			this.end_date.setFullYear(year + 5);
		}
		if(vals.length === 6){
			var n = parseInt(vals[0]);
			var m = parseInt(vals[1]);
			if(m <= n) {
				var i = (n*(n+1)/2+m);
				this.main_field_coeff_g[i] = parseFloat(vals[2]);
				this.main_field_coeff_h[i] = parseFloat(vals[3]);
				this.secular_var_coeff_g[i] = parseFloat(vals[4]);
				this.secular_var_coeff_h[i] = parseFloat(vals[5]);
			}
			if(n > this.n_max){
				this.n_max = n;
			}
		}
	}
	this.num_terms = this.n_max*(this.n_max+1)/2 + this.n_max;
}

Model.prototype.getTimedModel = function(date){
	var dyear = date.getFullYear() - this.epoch;

	var model = new Model({
		epoch: this.epoch,
		n_max: this.n_max,
		n_max_sec_var: this.n_max_sec_var,
		name: this.name
	});
	var a = model.n_max_sec_var;
	var b = a*(a + 1)/2 + a;
	for(var n = 1; n <= this.n_max; n++){
		for(var m = 0; m <= n; m++){
			var i = n * (n + 1)/2 + m;
			var hnm = this.main_field_coeff_h[i];
			var gnm = this.main_field_coeff_g[i];
			var dhnm = this.secular_var_coeff_h[i];
			var dgnm = this.secular_var_coeff_g[i];
			if(i <= b){
				model.main_field_coeff_h[i] = hnm + dyear*dhnm;
				model.main_field_coeff_g[i] = gnm + dyear*dgnm;
				model.secular_var_coeff_h[i] = dhnm;
				model.secular_var_coeff_g[i] = dgnm;
			} else {
				model.main_field_coeff_h[i] = hnm;
				model.main_field_coeff_g[i] = gnm;
			}
		}
	}
	return model;
}

Model.prototype.getSummation = function(legendre, sph_variables, coord_spherical){
	var bx = 0;
	var by = 0;
	var bz = 0;
	var n, m, i, k;
	var relative_radius_power = sph_variables.relative_radius_power;
	var cos_mlambda = sph_variables.cos_mlambda;
	var sin_mlambda = sph_variables.sin_mlambda;
	var g = this.main_field_coeff_g;
	var h = this.main_field_coeff_h;

	for(n = 1; n <= this.n_max; n++){
		for(m = 0; m <= n; m++){
			i = n*(n+1)/2 + m;
			bz -= relative_radius_power[n] *
				(g[i]*cos_mlambda[m] + h[i]*sin_mlambda[m]) *
				(n+1) * legendre.pcup[i];
			by += relative_radius_power[n] *
				(g[i]*sin_mlambda[m] - h[i]*cos_mlambda[m]) *
				(m) * legendre.pcup[i];
			bx -= relative_radius_power[n] *
				(g[i]*cos_mlambda[m] + h[i]*sin_mlambda[m]) *
				legendre.dpcup[i]; 
		}
	}
	var cos_phi = Math.cos(Math.PI/180 * coord_spherical.phig);
	if(Math.abs(cos_phi) > 1e-10){
		by = by / cos_phi;
	} else {
		//special calculation around poles
		by = 0;
		var schmidt_quasi_norm1 = 1.0, schmidt_quasi_norm2, schmidt_quasi_norm3;
		var pcup_s = [1];
		var sin_phi = Math.sin(Math.PI/180 * coord_spherical.phig); 
		
		for(n = 1; n <= this.n_max; n++){
			i = n*(n+1)/2 + 1;
			schmidt_quasi_norm2 = schmidt_quasi_norm1 * (2*n-1) / n;
			schmidt_quasi_norm3 = schmidt_quasi_norm2 * Math.sqrt(2*n/(n+1));
			schmidt_quasi_norm1 = schmidt_quasi_norm2;
			if(n == 1){
				pcup_s[n] = pcup_s[n-1];
			} else {
				k = ((n-1)*(n-1) - 1) / ((2*n-1)*(2*n-3));
				pcup_s[n] = sin_phi * pcup_s[n-1] - k*pcup_s[n-2];
			}
			by += relative_radius_power[n] * 
				(g[i]*sin_mlambda[1] - h[i]*cos_mlambda[1]) *
				pcup_s[n] * schmidt_quasi_norm3;
		}
	}
	return new MagneticVector({
		bx: bx, by: by, bz: bz
	});
}


/*
Model.prototype.getSecVarSummation = function(sph_variables, coord_spherical){
	//TODO
}
*/

Model.prototype.getPointInfo = function(coord_geodetic){
	var coord_geodetic = new GeodeticCoord(coord_geodetic);
	var coord_spherical = coord_geodetic.toSpherical();
	
	var legendre = coord_spherical.getLegendreFunction(this.n_max);
	var harmonic_variables = coord_spherical.getHarmonicVariables(coord_geodetic.ellipsoid, this.n_max);
	
	var magnetic_vector_sph = this.getSummation(legendre, harmonic_variables);
	var magnetic_vector_geo = magnetic_vector_sph.rotate(coord_spherical, coord_geodetic);
	
	return MagneticElements.fromGeoMagneticVector(magnetic_vector_geo);
};
