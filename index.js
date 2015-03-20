var path = require('path');
var Model = require('./lib/model.js');

var base_model;
var models = {};

function getModel(date){
	date = date || new Date();
	var year = date.getFullYear();
	if(!base_model){
		load();
	}
	if(!models[year]) {
		models[year] = base_model.getTimedModel(date);
	}
	return models[year];
}

function load(options){
	base_model = new Model();
	models = {};
}

module.exports = {
	load: load,
	get: getModel
}