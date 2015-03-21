var Model = require('./lib/model.js');
var geomagnetism = module.exports = {};

var base_model;
var models = {};

geomagnetism.model = function(date) {
	date = date || new Date();
	var key = date.toDateString();
	if (!base_model) {
		base_model = new Model();
	}
	if (!models[key]) {
		models[key] = base_model.getTimedModel(date);
	}
	return models[key];
};