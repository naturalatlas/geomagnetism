module.exports = MagneticElements;

function MagneticElements(options){
	this.x = options.x;
	this.y = options.y;
	this.z = options.z;
	this.h = options.h;
	this.f = options.f;
	this.incl = options.incl;
	this.decl = options.decl;
	this.gv = options.gv;
	this.xdot = options.xdot;
	this.ydot = options.ydot;
	this.zdot = options.zdot;
	this.hdot = options.hdot;
	this.fdot = options.fdot;
	this.incldot = options.incldot;
	this.decldot = options.decldot;
	this.gvdot = options.gvdot;
}

MagneticElements.prototype.clone = function(){
	return new MagneticElements(this);
};

MagneticElements.prototype.scale = function(factor){
	return new MagneticElements({
		x : this.x * factor,
		y : this.y * factor,
		z : this.z * factor,
		h : this.h * factor,
		f : this.f * factor,
		incl : this.incl * factor,
		decl : this.decl * factor,
		gv : this.gv * factor,
		xdot : this.xdot * factor,
		ydot : this.ydot * factor,
		zdot : this.zdot * factor,
		hdot : this.hdot * factor,
		fdot : this.fdot * factor,
		incldot : this.incldot * factor,
		decldot : this.decldot * factor,
		gvdot : this.gvdot * factor
	});
};

MagneticElements.prototype.subtract = function(subtrahend){
	return new MagneticElements({
		x : this.x - subtrahend.x,
		y : this.y - subtrahend.y,
		z : this.z - subtrahend.z,
		h : this.h - subtrahend.h,
		f : this.f - subtrahend.f,
		incl : this.incl - subtrahend.incl,
		decl : this.decl - subtrahend.decl,
		gv : this.gv - subtrahend.gv,
		xdot : this.xdot - subtrahend.xdot,
		ydot : this.ydot - subtrahend.ydot,
		zdot : this.zdot - subtrahend.zdot,
		hdot : this.hdot - subtrahend.hdot,
		fdot : this.fdot - subtrahend.fdot,
		incldot : this.incldot - subtrahend.incldot,
		decldot : this.decldot - subtrahend.decldot,
		gvdot : this.gvdot - subtrahend.gvdot
	});
};

MagneticElements.fromGeoMagneticVector = function(magnetic_vector){
	var bx = magnetic_vector.bx;
	var by = magnetic_vector.by;
	var bz = magnetic_vector.bz;
	var h = Math.sqrt(bx*bx + by*by);
	return new MagneticElements({
		x: bx,
		y: by,
		z: bz,
		h: h,
		f: Math.sqrt(h*h + bz*bz),
		decl: 180/Math.PI * Math.atan2(by, bx),
		incl: 180/Math.PI * Math.atan2(bz, h)
	});
};

MagneticElements.fromSecularVariationVector = function(magnetic_variation){
	var bx = magnetic_variation.bx;
	var by = magnetic_variation.by;
	var bz = magnetic_variation.bz;
	return new MagneticElements({
		xdot: bx,
		ydot: by,
		zdot: bz,
		hdot: (this.x*bx + this.y*by) / this.h,
		fdot: (this.x*bx + this.y*by + this.z*bz) / this.f,
		decldot: 180/Math.PI * (this.x*this.ydot - this.y*this.xdot) / (this.h*this.h),
		incldot: 180/Math.PI * (this.h*this.zdot - this.z*this.hdot) / (this.f*this.f),
		gvdot: this.decldot
	});
};