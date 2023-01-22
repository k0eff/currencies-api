'use strict';

const { pipeline } = require('stream');
const { promisify } = require('util');

const ECBAdaptor = require('../../../lib/adaptors/ECB/index.js');
const MongoStorage = require('../../../lib/storage/Mongodb');

const asyncPipeline = promisify(pipeline);

const urls = {
	historic: 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip',
	daily: 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref.zip',
};


module.exports = async (cli, mode = 'daily') => {
	if (!mode || !(mode in urls))
		return cli.error(`Invalid mode provided, use one of the followoing: [${Object.keys(urls).join('|')}]`);

	const mongo = new MongoStorage({ dbName: cli.config.mongo.dbName });

	await mongo.connect();

	console.time();

	await asyncPipeline(
		...ECBAdaptor.getParseStreams({ url: urls[mode] }), // parser streams
		mongo.getBatchStream(),
	);

	console.timeEnd();

	// error should be handeld on the outer layer, let it fail
	cli.end(`Synced ECB succsefully in ${mode} mode`);
};
