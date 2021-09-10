#! /usr/bin/env node

const chalk = require('chalk')
var parseFile = require('./lib/parseFile.js');



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
		parseFile(p)
	});
}