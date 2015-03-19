module.exports = LegendreFunction;

function LegendreFunction(coord_spherical, n_max){
	var sin_phi = Math.sin(Math.PI/180 * coord_spherical.phig);
	var result;
	if(n_max <= 16 || (1 - Math.abs(sin_phi)) < 1e-10){
		result = PcupLow(sin_phi, n_max);
	} else {
		result = PcupHigh(sin_phi, n_max);
	}
	this.pcup = result.pcup;
	this.dpcup = result.dpcup;
}

function PcupLow(x, n_max){
	var k, z, n, m, i, i1, i2, num_terms;
	var schmidt_quasi_norm = [1.0];
	var pcup = [1.0];
	var dpcup = [0.0];

	z = Math.sqrt((1-x)*(1+x));
	num_terms = (n_max+1) * (n_max+2) / 2;


	for(n = 1; n <= n_max; n++) {
		for(m = 0; m <= n; m++) {
			i = n*(n+1)/2 + m;
			if(n == m){
				i1 = (n-1)*n/2 + m - 1;
				pcup[i] = z*pcup[i1];
				dpcup[i] = z*dpcup[i1] + x*pcup[i1];
			} else if (n == 1 && m == 0) {
				i1 = (n-1)*n/2 + m;
				pcup[i] = x*pcup[i1];
				dpcup[i] = x*dpcup[i1] - z*pcup[i1];
			} else if (n > 1 && n != m) {
				i1 = (n-2)*(n-1)/2 + m;
				i2 = (n-1)*n/2 + m;
				if(m > n - 2){
					pcup[i] = x*pcup[i2];
					dpcup[i] = x*dpcup[i2] - z*pcup[i2];
				} else {
					k = ((n-1)*(n-1) - m*m) / ((2*n-1)*(2*n-3));
					pcup[i] = x*pcup[i2] - k*pcup[i1];
					dpcup[i] = x*dpcup[i2] - z*pcup[i2] - k*dpcup[i1];
				}
			}
		}
	}
	
	for(n = 1; n <= n_max; n++) {
		i = n*(n+1)/2;
		i1 = (n-1)*n/2;
		schmidt_quasi_norm[i] = schmidt_quasi_norm[i1] * (2*n-1) / n;
		for(m = 1; m <= n; m++){
			i = n*(n+1)/2 + m;
			i1 = n*(n+1)/2 + m - 1;
			schmidt_quasi_norm[i] = schmidt_quasi_norm[i1] * Math.sqrt(((n - m + 1) * (m == 1 ? 2 : 1)) / (n + m));
		}	
	}

	for(n = 1; n <= n_max; n++) {
		for(m = 0; m <= n; m++) {
			i = n*(n+1)/2+m;
			pcup[i] *= schmidt_quasi_norm[i];
			dpcup[i] *= -schmidt_quasi_norm[i];
		}
	}

	return {
		pcup: pcup,
		dpcup: dpcup
	};
}

function PcupHigh(x, n_max){
	if(Math.abs(x) == 1.0){
		throw new Error("Error in PcupHigh: derivative cannot be calculated at poles");
	}

	var n, m, k;
	var num_terms = (n_max + 1) * (n_max + 2)/2;
	var f1 = [];
	var f2 = [];
	var pre_sqr = [];
	var scalef = 1.0e-280;

	for(n = 0; n <= 2*n_max + 1; ++n){
		pre_sqr[n] = Math.sqrt(n);
	}

	k = 2;
	for(n = 0; n <= n_max; n++){
		k++;
		f1[k] = (2*n - 1) / n;
		f2[k] = (n - 1) / n;
		for(m = 1; m <= n - 2; m++){
			k++;
			f1[k] = (2*n - 1) / pre_sqr[n+m] / pre_sqr[n-m];
			f2[k] = pre_sqr[n-m-1] * pre_sqr[n+m-1] / pre_sqr[n+m] / pre_sqr[n-m];
		}
		k += 2;
	}

	var z = Math.sqrt((1-x)*(1+x));
	var plm;
	var pm1 = x;
	var pm2 = 1;
	var pcup = [1.0, pm1];
	var dpcup = [0.0, z];
	if(n_max == 0){
		throw new Error("Error in PcupHigh: n_max must be greater than 0");
	}
	
	k = 1;
	for(n = 2; n <= n_max; n++)
	{
		k = k + n;
		plm = f1[k] * x * pm1 - f2[k] * pm2;
		pcup[k] = plm;
		dpcup[k] = n * (pm1 - x * plm) / z;
		pm2 = pm1;
		pm1 = plm;
	}

	var pmm = pre_sqr[2] * scalef;
	var rescalem = 1/scalef;
	var kstart = 0;

	for(var m = 1; m <= n_max - 1; ++m){
		rescalem *= z;

		//calculate pcup(m,m)
		kstart = kstart + m + 1;
		pmm = pmm * pre_sqr[2*m+1] / pre_sqr[2*m];
		pcup[kstart] = pmm * rescalem / pre_sqr[2*m+1];
		dpcup[kstart] = -( m*x*pcup[kstart] /z );
		pm2 = pmm / pre_sqr[2*m + 1];

		//calculate pcup(m+1,m)
		k = kstart + m + 1;
		pm1 = x * pre_sqr[2*m+1] * pm2;
		pcup[k] = pm1*rescalem;
		dpcup[k] = (pm2*rescalem *pre_sqr[2*m+1] - x*(m+1)*pcup[k]) / z;

		//calculate pcup(n,m)
		for(n = m + 2; n <= n_max; ++n){
			k = k + n;
			plm = x*f1[k]*pm1 - f2[k]*pm2;
			pcup[k] = plm*rescalem;
			dpcup[k] = (pre_sqr[n+m]*pre_sqr[n-m]*pm1*rescalem - n*x*pcup[k]) / z;
			pm2 = pm1;
			pm1 = plm;
		}
	}

	//calculate pcup(n_max,n_max)
	rescalem = rescalem*z;
	kstart = kstart + m + 1;
	pmm = pmm / pre_sqr[2*n_max];
	pcup[kstart] = pmm * rescalem;
	dpcup[kstart] = -n_max * x * pcup[kstart] / z;

	return {
		pcup: pcup,
		dpcup: dpcup
	};
}
