#!/usr/bin/env node

'use strict';

const config = require('../config/config');

const commands = {
	sync: require('./commands/sync'), // eslint-disable-line
};

const konzola = console;


const handleException = (ex) => {
	const msg = ex ? typeof ex === 'string' ? ex : ex.message : null; // eslint-disable-line
	if (msg)
		konzola.info(msg);
	/*
	if (ex.stack)
		konzola.info(ex.stack);
		*/
	process.exit(ex.code || 1);
};


const cli = {
	error: handleException,
	end: () => process.exit(0),
	config,
};

const [,, command, subcommand, mode] = process.argv;

if (!command || !(command in commands))
	return cli.error(`Invalid subcmmand provided, use one of the followoing: [${Object.keys(commands).join('|')}]`);

return commands[command](cli, subcommand, mode);
