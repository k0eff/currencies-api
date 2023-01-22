'use strict';

require('dotenv').load();

const config = require('../config/config');

const log = require('./lib/log');
const express = require('./lib/express');
const routes = require('./routes');

const server = require('./lib/http');
const packageJSON = require('../package');
const serialization = require('./serialization');

const app = {
	name: packageJSON.name,
	version: packageJSON.version,
};

app.root = __dirname;
app.log = log(app);
app.config = config;

app.ExchangeRecord = require('./lib/ExchangeRecord');
app.serialization = serialization(app);

app.express = express(app);
app.routes = routes(app);

app.server = server(app);

module.exports = app;
