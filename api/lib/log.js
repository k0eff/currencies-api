'use strict';

const pino = require('pino');

/**
 * app.log.error('this is error');
 * app.log.info('this is info');
 * app.log.debug('this is debug');
 */
module.exports = (app, namespace) => {
	const logger = pino({
		name: `${namespace || app.name} (${app.version})`,
		level: process.env.LOG_LEVEL || 'debug',
		enabled: process.env.LOG_ENABLED,
	});

	logger.fatal('fatal logging is [ON]');
	logger.error('error logging is [ON]');
	logger.warn('warn logging is [ON]');
	logger.info('info logging is [ON]');
	logger.debug('debug logging is [ON]');
	logger.trace('trace logging is [ON]');

	return logger;
};
