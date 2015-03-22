module.exports = function(str){
	var result = {
		main_field_coeff_g: [0],
		main_field_coeff_h: [0],
		secular_var_coeff_g: [0],
		secular_var_coeff_h: [0],
		n_max: 0,
		n_max_sec_var: 0
	};
	var lines = str.split(/\r?\n/);
	for(var i = 0; i < lines.length; i++) {
		var line = lines[i];
		var vals = line.match(/\S+/g);
		if(!vals) continue;
		if(vals.length === 3){
			result.epoch = parseFloat(vals[0]);
			result.name = vals[1];
			result.start_date = new Date(vals[2]);
			result.end_date = new Date(vals[2]);
			var year = result.start_date.getFullYear();
			result.end_date.setFullYear(year + 5);
		}
		if(vals.length === 6){
			var n = parseInt(vals[0]);
			var m = parseInt(vals[1]);
			if(m <= n) {
				var i = (n*(n+1)/2+m);
				result.main_field_coeff_g[i] = parseFloat(vals[2]);
				result.main_field_coeff_h[i] = parseFloat(vals[3]);
				result.secular_var_coeff_g[i] = parseFloat(vals[4]);
				result.secular_var_coeff_h[i] = parseFloat(vals[5]);
			}
			if(n > result.n_max){
				result.n_max = n;
				result.n_max_sec_var = n;
			}
		}
	}
	return result;
};