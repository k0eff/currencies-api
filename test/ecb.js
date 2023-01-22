'use strict';

const path = require('path');

const ECBAdaptor = require('../lib/adaptors/ECB/index.js');
const MongoStorage = require('../lib/storage/Mongodb');

const ebc = new ECBAdaptor({ url: 'http://www.ecb.europa.eu/stats/eurofxref/eurofxref.zip?2ad5a17b3cdbbda086ba8be7e3f97fee' });
// const ebc = new ECBAdaptor({ url: 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip?4832191398eedb9b2c625efc9eb8a920' });

const mongo = new MongoStorage({
	dbName: 'test-currencies-history',
});
(async () => {
	// const s = ebc.testFile(path.join(process.cwd(), './test/fixtures/ecb/eurofxref-hist.csv'));
	// const s = ebc.testFile(path.join(process.cwd(), './test/fixtures/ecb/2018-07-03.csv'));
	// const s = ebc.testFile(path.join(process.cwd(), './test/fixtures/ecb/small.csv'));

	await mongo.connect();

	// const s = ebc.testZip(path.join(process.cwd(), './test/fixtures/ecb/csv-wrong.zip'));
	const s = ebc.testUrl();
	// return;
	const mongoStream = mongo.stream();

	mongoStream
		.on('finish', () => {
			mongoStream.end();
			process.exit(0);
		})
		.on('end', () => {
			process.exit(0);
		})
		.on('error', (e) => {
			console.log()
			process.exit(1);
		})
		.pipe(mongoStream);
})();
