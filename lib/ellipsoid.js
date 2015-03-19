module.exports = Ellipsoid;

function Ellipsoid(options) {
    options = options || {
        a: 6378.137,
        b: 6356.7523142,
        fla: 1 / 298.257223563,
        re: 6371.2
    };

    this.a = options.a; // semi-major axis
    this.b = options.b; // semi-minor axis
    this.fla = options.fla; // flattening
    this.re = options.re; // mean radius
    this.eps = Math.sqrt(1-(this.b*this.b)/(this.a*this.a)); // first eccentricity
    this.epssq = this.eps*this.eps; // first eccentricity squared
}