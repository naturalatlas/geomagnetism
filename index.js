var Model = require('./lib/model.js');
var geomagnetism = module.exports = {};

var base_model;

geomagnetism.model = function(date) {
	date = date || new Date();
	if (!base_model) {
		base_model = new Model();
	}
	return base_model.getTimedModel(date);
};