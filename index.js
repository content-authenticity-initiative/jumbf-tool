#! /usr/bin/env node

const chalk = require('chalk')
var mime = require('mime-types')
var path = require('path');

var parseFile = require('./lib/parseFile.js');
var parseJPEG = require('./lib/parseJPEG.js');

var argPaths = []

function addPath(value) {
	return argPaths.push(value);
}
  
// program options...
const { program } = require('commander')
program.version('0.0.1');
program
	.option('-d, --debug', 'Enable debugging options')
	.argument('<path...>', 'file paths to be processed', addPath, 0)

// parse the command line!
program.parse(process.argv)
const options = program.opts();
const args = program.args;

// console.log('Options: ', options);
// console.log('Paths: ', argPaths);
// console.log('Remaining arguments: ', args);

if ( argPaths.length > 0 ) {
	argPaths.forEach(p => {
		console.log( chalk.bold(`Processing ${p}`) )
		
		mType = mime.lookup(p);
		if ( mType ) {	// valid mime type
			if ( mType == "image/jpeg" ) {
				console.log( chalk.red.bold(`Found JPEG!`) );
				parseJPEG(p)
			}
		} else {
			fExt = path.extname(p);
			if ( fExt == ".jumbf" ) {
				parseFile(p)
			}
		}
	});
}