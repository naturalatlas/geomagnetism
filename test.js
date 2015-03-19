var Model = require('./index.js');
var model = Model.get();
var info = model.getPointInfo({
	lat: 44.53461,
	lon: -109.05572
});
console.log(info);