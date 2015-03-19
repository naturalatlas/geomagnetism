# geomagnetic-model
Get magnetic declination for given time and place with javascript.

An adaptation of the World Magnetic Model by the NOAA National Geophysical Data Center.
http://www.ngdc.noaa.gov/geomag/WMM/DoDWMM.shtml

```js
	var MagneticModel = require('geomagnetic-model');

	var model = MagneticModel.get(new Date());
	var info = model.getPointInfo({
		lat: 44.53461,
		lon: -109.05572
	});
	console.log('declination:', info.decl);
```