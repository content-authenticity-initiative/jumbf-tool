var fs = require('fs');
const chalk = require('chalk')
const errMsg = chalk.bold.red;
var hexy = require('hexy');

var jpeg = require('./jpeg.js');
const processJUMBF = require('./processJUMBF.js');

// hex dumps a buffer to the console (in my preferred format)
function hexDump( data ) {
	var format = {}
		format.format = "twos"	// every two bytes	
		format.offset = sectionOffset
		format.length = 32				
	console.log(hexy.hexy(data, format));
}

function parseStream( fs ) {
	var start = fs.mark(),
		stream = start.openWithOffset(0),
		flags = {
			simplifyValues: true,
			imageSize: true
		};
	var jumbfArr = [],
		foundApp11 = false;

	jpeg.parseSections(stream, function(sectionType, sectionStream) {
		var validExifHeaders, sectionOffset = sectionStream.offsetFrom(start);
		var sect = jpeg.getSectionName(sectionType), sectName = sect.name;
		if(typeof sect.index === 'number') {
			sectName += `${sect.index}`;
		}

		// console.log(`${sectName} starts at ${sectionOffset}`);

		if( sectName == "APP11" ) {
			var dump = false;	// really need to check the debug flag
			if ( dump ) {
				hexDump(sectionStream.buffer)
			}


			// the 8 skips over the standard `JP` APP11 marker to the JUMBF itself
			// unless this is a secondary one, then we need to skip 16 bytes (passed the header)
			var offset = foundApp11 ? 16 : 8;
			var len = sectionStream.length;
			if ( sectionStream.buffer[sectionOffset+offset+2] == 0x00 )
				offset += 2;
			var startLoc = sectionOffset+offset;
			var appBuffer = sectionStream.buffer.slice(startLoc, startLoc+len-offset);

			if ( dump ) {
				hexDump(appBuffer)
			}

			jumbfArr.push( appBuffer );
			foundApp11 = true;
		}
		else if(flags.imageSize && jpeg.getSectionName(sectionType).name === 'SOF') {
			imageSize = jpeg.getSizeFromSOFSection(sectionStream);
		}
	});

	var jumbfBuff = Buffer.concat(jumbfArr);
	return jumbfBuff;
}

function parseJPEG(fPath) {
	try {
		var fileBuffArr = [];

		var fStream = fs.createReadStream(fPath, {
			flags: 'r',
			encoding: null,
			fd: null,
			mode: 0666,
			autoClose: true
		});

		// An error occurred with the stream
		fStream.once('error', (err) => {
			// Be sure to handle this properly!
			console.error(errMsg(err)); 
		});

		// File is done being read
		fStream.once('end', () => {
			// create the final data Buffer from data chunks;
			fileBuffer = Buffer.concat(fileBuffArr);
			
			// convert the Node Buffer into something we can run through the JPEG parser
			var NodeBufferStream = require('./bufferstream.js');
			var stream = new NodeBufferStream(fileBuffer, 0, fileBuffer.length, true);
	
			// parse it!
			var jumbf = parseStream( stream );

			// and the do something with it (like dump to console)
			processJUMBF(jumbf);
		});

		// Data is flushed from fileStream in chunks,
		// this callback will be executed for each chunk
		fStream.on('data', (chunk) => {
			fileBuffArr.push(chunk); // push data chunk to array
		});
	} catch (err) {
		console.error(errMsg(err))
	}
}

module.exports = parseJPEG
