const Model = require('./lib/model.js');
const geomagnetism = module.exports = {};

const modelData = [
	{
		file: require('./data/wmm-2025.json'),
		startDate: new Date("2024-11-13T03:00:00.000Z"),
		endDate: new Date("2029-11-13T03:00:00.000Z")
	},
	{
		file: require('./data/wmm-2020.json'),
		startDate: new Date("2019-12-10T08:00:00.000Z"),
		endDate: new Date("2024-12-10T08:00:00.000Z")
	},
	{
		file: require('./data/wmm-2015v2.json'),
		startDate: new Date("2018-09-18T06:00:00.000Z"),
		endDate: new Date("2023-09-18T06:00:00.000Z")
	},
	{
		file: require('./data/wmm-2015.json'),
		startDate: new Date("2014-12-15T07:00:00.000Z"),
		endDate: new Date("2019-12-15T07:00:00.000Z")
	}
];


geomagnetism.model = function (date, options = {}) {
	date = date || new Date();
	const ts = date.getTime();

	const allowOutOfBoundsModel = (options && options.allowOutOfBoundsModel) || false;

	// Get the latest matching model 
	let matchingModelData = modelData.find((model) => {
		return ts >= model.startDate.getTime() && ts <= model.endDate.getTime();
	});

	// Get if the date is before the first model or after the last model
	if (!matchingModelData && ts < modelData[modelData.length - 1].startDate.getTime()) {
		matchingModelData = modelData[modelData.length - 1];
	} else if (!matchingModelData && ts > modelData[0].endDate.getTime()) {
		matchingModelData = modelData[0];
	}

	// If no matching model found, use the latest
	if (!matchingModelData) {
		matchingModelData = modelData[0]; // latest (will throw error if allowOutOfBoundsModel is true)
	}

	const matchingModel = new Model(matchingModelData.file);

	return matchingModel.getTimedModel(date, allowOutOfBoundsModel);
};
