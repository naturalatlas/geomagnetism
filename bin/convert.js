var fs = require('fs');
var path = require('path');

/**
 * Converts a coefficients file to a .json file that can be used to initialize a base model
 *
 * ex: node bin/convert WMM.COF wmm.json
 */

function exit(err){
	console.log("Error: "+err);
	process.exit(1);
}


var input_filename = process.argv[2];
var output_filename = process.argv[3];
if(!input_filename) exit("Input filename must be provided.");
if(!output_filename) exit("Output filename must be provided.");

// get parser by input file extension
var ext = path.extname(input_filename).toLowerCase().substr(1);
var parser;
try {
	parser = require('../lib/parsers/'+ext);
} catch (err) {
	exit("Unable to find parser for ."+ext+" file.");
}

var data = fs.readFileSync(input_filename, {encoding: 'utf8'});
var obj = parser(data);
var json = JSON.stringify(obj, null, 2);

fs.writeFileSync(output_filename, json);

console.log(output_filename + " successfully created");