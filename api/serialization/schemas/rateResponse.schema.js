'use strict';

/* eslint-disable global-require */
module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$title: 'rateResponse',
	$async: true,
	description: 'API Response containing rates & exchange data',
	type: 'object',
	properties: {
		id: { type: 'string' },
		source: { type: 'string' },
		date: { type: 'string', format: 'date-time' },
		rates: require('./rate.schema'),
		currency: require('./currency.schema'),
	},
};
