'use strict';

const fs = require('fs');
const request = require('request');
const { Transform } = require('stream');

const unzip = require('unzipper');
/*
const SUPPORTED_CURRENCIES = [
	'USD', // Us Dollars
	'BGN', // Bulgarian Lev
	'CHF', // Swiss Francs
];
*/

const parse = require('csv-parser');

const ECBDate = require('./ECBDate');

const getCsvParser = () => parse({
	separator: ',',
	quote: false,
	strict: true,
});

class TransfromEcb extends Transform {
	constructor(config) {
		super({ objectMode: true });
		this.config = config;
	}

	_transform(obj, _, next) {
		obj.calculateRates(r => this.push(r));
		next();
	}
}

module.exports = class ECBAdaptor {
	constructor({ url } = {}) {
		this.url = url;
	}

	testZip(zipPath) { // eslint-disable-line
		return ECBAdaptor._parseResults(fs.createReadStream(zipPath).pipe(unzip.ParseOne(/\.csv$/)));
	}

	testUrl() {
		if (!this.url)
			throw new Error('URL not provided');

		return ECBAdaptor._parseResults(request(this.url).pipe(unzip.ParseOne(/\.csv$/)));
	}

	static _parseResults(incomingStream) {
		return incomingStream.pipe(getCsvParser()).pipe(ECBDate.stream({ process: ECBDate.all() })).pipe(new TransfromEcb());
	}

	static getParseStreams({ url = '' }) {
		return [
			request(url),
			unzip.ParseOne(/\.csv$/),
			getCsvParser(),
			ECBDate.stream({ process: ECBDate.all() }),
			new TransfromEcb(),
		];
	}

	testFile(file) { // eslint-disable-line class-methods-use-this
		if (!fs.existsSync(file))
			throw new Error('File not found');

		return fs.createReadStream(file)
			.pipe(getCsvParser())
			.pipe(ECBDate.stream({ process: ECBDate.all() }))
			.pipe(new TransfromEcb());
	}
};
