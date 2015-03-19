var fs = require('fs');
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

function load(data){
	if(!data) {
		var filename = path.resolve(__dirname, 'WMM.COF');
		data = fs.readFileSync(filename, {encoding: 'utf8'});
		console.log(data.split)
	}
	base_model = new Model();
	base_model.load(data);
	models = {};
}

module.exports = {
	load: load,
	get: getModel
}