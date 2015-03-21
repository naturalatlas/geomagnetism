var Model = require('./lib/model.js');
var geomagnetism = module.exports = {};

var base_model;
var models = {};

geomagnetism.model = function(date) {
	date = date || new Date();
	var year = date.getFullYear();
	if (!base_model) {
		base_model = new Model();
	}
	if (!models[year]) {
		models[year] = base_model.getTimedModel(date);
	}
	return models[year];
};