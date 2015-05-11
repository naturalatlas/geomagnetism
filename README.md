# geomagnetism
[![NPM version](http://img.shields.io/npm/v/geomagnetism.svg?style=flat)](https://www.npmjs.org/package/geomagnetism)
[![Build Status](http://img.shields.io/travis/naturalatlas/geomagnetism/master.svg?style=flat)](https://travis-ci.org/naturalatlas/geomagnetism)
[![Coverage Status](http://img.shields.io/coveralls/naturalatlas/geomagnetism/master.svg?style=flat)](https://coveralls.io/r/naturalatlas/geomagnetism)

Get magnetic declination for given time and place. It's an adaptation of the [World Magnetic Model](http://www.ngdc.noaa.gov/geomag/WMM/DoDWMM.shtml) by the [NOAA National Geophysical Data Center](https://www.ngdc.noaa.gov/).

``` sh
$ npm install geomagnetism --save
```

### Usage

```js
var geomagnetism = require('geomagnetism');

// information for "right now"
var info = geomagnetism.model().point([44.53461, -109.05572]);
console.log('declination:', info.decl);

// use a specific date
var model = geomagnetism.model(new Date('12/25/2017'));
var info = model.point([44.53461, -109.05572]);
console.log('declination:', info.decl);
```

## License

Copyright &copy; 2015 [Natural Atlas, Inc.](https://naturalatlas.com/) & [Contributors](https://github.com/naturalatlas/geomagnetism/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
