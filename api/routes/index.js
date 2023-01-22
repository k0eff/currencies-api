'use strict';

const express = require('express');
const ecb = require('../../bin/commands/subcommands/ecb');

const MongoStorage = require('../../lib/storage/Mongodb');


const errorHandler = app => (err, req, res, next) => {
	app.log.error(err);
	if (res.headersSent) return next(err);
	const extractedErr = {
		message: err.message ? err.message : undefined,
		stack: err.stack ? err.stack : undefined,
		status: err.status ? err.status : undefined,
		code: err.code ? err.code : undefined,
	};

	return res.status(500).send({
		success: false,
		error: extractedErr,
	});
};

// execute controller, serialize and send or catch errors and pass them to error middleware
const requestHandler = (controller, { schema, serialize } = {}) => async (req, res, next) => {
	try {
		const result = await controller(req, res);
		const json = (!!schema && !!serialize) ? serialize(schema, result) : JSON.stringify(result);
		// const json = JSON.stringify(result); // for testing
		res.set('Content-Type', 'application/json');
		res.send(json);
	} catch (e) {
		next(e);
	}
};


module.exports = (app) => {
	const router = new express.Router();
	const mongo = new MongoStorage({ dbName: app.config.mongo.dbName });

	const { serialize } = app.serialization;

	const controllers = {
		index: () => ({
			name: 'Currencies API',
			version: 1,
		}),
		exchange: async (req /* res */) => {
			const { amount = 1, from, currency: smallCurrency } = req.params;
			const { rounding = 4 } = req.query;

			const currency = smallCurrency.toUpperCase();
			await mongo.connect();

			const rate = await mongo.findFirst({ currency, from });
			const result = new app.ExchangeRecord(rate, amount, Number(rounding));

			return result;
		},
		rateSingle: async (req /* res */) => {
			let { currency } = req.params;
			const { from } = req.params;
			currency = currency.toUpperCase();
			await mongo.connect();

			const [rate] = await mongo.findClosestRate({ from, currency }).toArray();

			if (!rate || (rate.constructor === Object && Object.keys(rate) < 1)) throw new Error('Rates unavailable');

			return rate;
		},
		rateMulti: async (req /* res */) => {
			let { currency, from, to = from } = req.params;
			currency = currency.toUpperCase();

			if (from > to) [from, to] = [to, from];

			await mongo.connect();

			const rates = await mongo.findAll({ from, to, currency }).toArray();
			if (!rates || (rates.constructor === Array && rates.length < 1)) throw new Error('Rates unavailable');
			return rates;
		},
		ecbDaily: async (req, res) => {
			const fakeCli = {
				config: app.config,
				error: (e) => {
					res.status(500).send({ error: `error: ${e}` });
				},
				end: async (m) => {
					await mongo.connect();
					const rates = await mongo.findFirst({ currency: 'USD' });
					res.status(200).send({ success: true, msg: m, rates: { latest: { USD: rates } } });
				},
			};

			await ecb(fakeCli, 'daily');
		},
	};


	router.get('/exchange/:currency/:amount/:from?', requestHandler(controllers.exchange, { schema: 'exchangeResponse', serialize }));
	router.get('/', requestHandler(controllers.index));
	router.get('/rates/:currency/:from', requestHandler(controllers.rateSingle, { schema: 'rateResponse', serialize }));
	router.get('/rates/:currency/:from/:to', requestHandler(controllers.rateMulti, { schema: 'ratesResponseMultiple', serialize }));
	router.get('/commands/sync/ecb/daily', controllers.ecbDaily);
	router.use(errorHandler(app));
	app.express.use(router);

	return router;
};
