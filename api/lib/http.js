'use strict';

const http = require('http');
const fs = require('fs');

/**
 * running express with a dedicated http server
 * will become useful in clustered deployments
 * and for example to server socket.io request
 * in parallel with express application
 */

module.exports = (app) => {
	// Add exception handling as last stop on Express middleware pipe line
	app.express.use((req, res) => res.status(404).send('Not Found'));

	app.express.use((err, req, res, next) => {
		app.log.error(`${err.name}: ${err.message}`);
		app.log.debug(err);

		res
			.status(err.statusCode || 500)
			.send(err.message || 'Internal Server Error');

		next();
	});

	const httpServer = http.Server(app.express);
	const PORT = app.config.api.port;

	httpServer.listen(PORT, () => {
		app.log.info(`please open http://localhost:${PORT}`);
		app.log.debug(app.config);
		app.log.info(`Node v${process.env.node_version}, NODE_ENV: ${process.env.NODE_ENV}`);

		fs.writeFile(`${app.root}/server.pid`, process.pid, (err) => {
			/* istanbul ignore next */
			if (err) throw err;
		});
	});

	return httpServer;
};
