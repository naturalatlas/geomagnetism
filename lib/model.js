var GeodeticCoord = require('./coords/geodetic.js');
var MagneticElements = require('./magnetic_elements.js');
var MagneticVector = require('./magnetic_vector.js');

module.exports = Model;

function Model(options){
	this.epoch = options.epoch;
	this.start_date = new Date(options.start_date);
	this.end_date = new Date(options.end_date);
	this.name = options.name || "";
	this.main_field_coeff_g = options.main_field_coeff_g || [0];
	this.main_field_coeff_h = options.main_field_coeff_h || [0];
	this.secular_var_coeff_g = options.secular_var_coeff_g || [0];
	this.secular_var_coeff_h = options.secular_var_coeff_h || [0];
	this.n_max = options.n_max || 0;
	this.n_max_sec_var = options.n_max_sec_var || 0;
	this.num_terms = this.n_max*(this.n_max+1)/2 + this.n_max;
}

Model.prototype.getTimedModel = function(date, allowOutOfBoundsModel = false){
	var year_int = date.getUTCFullYear();
	var fractional_year = (date.valueOf() - Date.UTC(year_int)) / (1000*3600*24*365);
	var year = year_int + fractional_year;
	var dyear = year - this.epoch;

	if(date < this.start_date || date > this.end_date){
		if(allowOutOfBoundsModel) {
			console.error("Model is only valid from "+this.start_date.toDateString()+" to "+this.end_date.toDateString());
		} else {
			throw new Error("Model is only valid from "+this.start_date.toDateString()+" to "+this.end_date.toDateString());
		}
	}

	var model = new Model({
		epoch: this.epoch,
		n_max: this.n_max,
		n_max_sec_var: this.n_max_sec_var,
		name: this.name,
		start_date: this.start_date,
		end_date: this.end_date,
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
};

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
};

Model.prototype.point = function(coords) {
	// Extract altitude if provided, otherwise default to 0
	var altitude = (coords.length > 2 && typeof coords[2] === 'number') ? coords[2] : 0;

	var coord_geodetic = new GeodeticCoord({
		lat: coords[0],
		lon: coords[1],
		height_above_ellipsoid: altitude
	});
	var coord_spherical = coord_geodetic.toSpherical();

	var legendre = coord_spherical.getLegendreFunction(this.n_max);
	var harmonic_variables = coord_spherical.getHarmonicVariables(coord_geodetic.ellipsoid, this.n_max);

	var magnetic_vector_sph = this.getSummation(legendre, harmonic_variables, coord_spherical);
	var magnetic_vector_geo = magnetic_vector_sph.rotate(coord_spherical, coord_geodetic);

	return MagneticElements.fromGeoMagneticVector(magnetic_vector_geo);
};
