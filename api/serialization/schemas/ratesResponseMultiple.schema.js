'use strict';

/* eslint-disable global-require */
module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$title: 'rateResponse',
	$async: true,
	description: 'API Response containing rates & exchange data',
	type: 'array',
	items: require('./rateResponse.schema'),
};
