# geomagnetism
[![NPM version](http://img.shields.io/npm/v/geomagnetism.svg?style=flat)](https://www.npmjs.org/package/geomagnetism)
[![Coverage Status](http://img.shields.io/coveralls/naturalatlas/geomagnetism/master.svg?style=flat)](https://coveralls.io/r/naturalatlas/geomagnetism)

`geomagnetism` provides a convenient interface for retrieving the Earth's magnetic declination (variation between magnetic north and true north) at a given location and date. It leverages NOAA's [World Magnetic Model (WMM)](https://www.ngdc.noaa.gov/geomag/WMM/) to compute properties such as declination, inclination, horizontal intensity, and more.

``` sh
$ npm install geomagnetism --save
```

### Usage

The main entry point is the `model()` function. If you pass it a Date object, it will compute results for that specific date. If you do **not** pass a date, it will default to the current date. Once you have a model, you can query it using the `point()` method, which expects an array representing latitude and longitude. Optionally, you can provide an altitude as a third element in the array.

- Latitude and longitude are required: `[lat, lon]`
- Altitude (optional) can be provided: `[lat, lon, altitude_in_kilometers]`

**Example: Current Date**

```js
const geomagnetism = require('geomagnetism');

// If no date is passed, the current date is used
const currentModel = geomagnetism.model();
const info = currentModel.point([44.53461, -109.05572]); // only lat/lon
console.log('Declination (current date):', info.decl, 'degrees');
```

**Example: Specific Date**

```js
const geomagnetism = require('geomagnetism');

// If a date is passed, that specific date is used
const specificDateModel = geomagnetism.model(new Date('2020-10-05'));
const info = specificDateModel.point([44.53461, -109.05572]);
console.log('Declination on 2020-10-05:', info.decl, 'degrees');
```

**Example: Including Altitude**

```js
const geomagnetism = require('geomagnetism');

// Provide altitude as the third array item (in kilometers above mean sea level)
const model = geomagnetism.model(new Date('2022-01-01'));
const infoWithAltitude = model.point([44.53461, -109.05572, 1.5]); 
console.log('Declination at altitude:', infoWithAltitude.decl, 'degrees');
```

## Handling Out-of-Range Dates

The `geomagnetism.model()` function determines the best available World Magnetic Model for the date you provide. If the given date falls outside the known range of the WMM data files, by default (`allowOutOfBoundsModel = false`), the function will throw an error indicating that no suitable model is found for the given date.

If you would prefer that the library "fall back" to the closest available model rather than throwing an error, you can explicitly pass true to allowOutOfBoundsModel option.

```js
geomagnetism.model(date, { allowOutOfBoundsModel: true });
```

- `date`: *(optional)* A JavaScript Date object. Defaults to the current date if not specified.
- `allowOutOfBoundsModel`: *(optional)* A boolean. If not specified or false, throws an error if the date is out of range. If true, falls back to the nearest available model.

**Examples:**

```js
const geomagnetism = require('geomagnetism');

// Strict behavior (default): If the date is out of range, an error is thrown
try {
  let model = geomagnetism.model(new Date('1900-01-01'));  // allowOutOfBoundsModel defaults to false
  let info = model.point([44.53461, -109.05572]);
} catch (err) {
  console.error('Error (strict mode):', err.message);
}

// Fallback behavior: If the date is out of range, it uses the closest model
let fallbackModel = geomagnetism.model(new Date('1900-01-01'), { allowOutOfBoundsModel: true });
let fallbackInfo = fallbackModel.point([44.53461, -109.05572]);
console.log('Declination using fallback model:', fallbackInfo.decl);
```

## Available Data & Models

`geomagnetism` ships with multiple versions of the WMM data, each valid for a certain time range. The library automatically picks the correct model based on the date you supply. Older models are included to gracefully handle historical dates when using the fallback behavior.

## License

Copyright &copy; 2015–2024 [Natural Atlas, Inc.](https://naturalatlas.com/) & [Contributors](https://github.com/naturalatlas/geomagnetism/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
