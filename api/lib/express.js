'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = () => {
	const app = express();

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	app.use(cors());

	app.use((req, res, next) => {
		req.param = (name, defaultValue) => {
			let { params } = req.params;

			params = Object.assign(params, req.query);
			params = Object.assign(params, req.body);

			return params[name] || defaultValue;
		};

		next();
	});

	return app;
};
