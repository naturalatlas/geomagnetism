var Model = require('./lib/model.js');
var geomagnetism = module.exports = {};

var models = null;
var modelData = [
	require('./data/wmm-2015v2.json'),
	require('./data/wmm-2015.json'),
];

var base_model;

geomagnetism.model = function(date) {
	date = date || new Date();
	if (!models) {
		models = modelData.map(function(data) {
			return new Model(data);
		});
	}

	var ts = date.getTime();
	var matchingModel;
	for (var i = 0, n = models.length; i < n; ++i) {
		if (models[i].start_date.getTime() > ts) continue;
		if (models[i].end_date.getTime() < ts) continue;
		matchingModel = models[i];
		break;
	}
	if (!matchingModel) {
		matchingModel = models[0]; // latest (will throw error)
	}

	return matchingModel.getTimedModel(date);
};
