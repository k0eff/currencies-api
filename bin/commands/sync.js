'use strict';

const subcommands = {
	ecb: require('./subcommands/ecb'), // eslint-disable-line
};

module.exports = (cli, subcommand, mode) => {
	if (!subcommand || !(subcommand in subcommands))
		return cli.error(`Invalid subcmmand provided, use one of the followoing: [${Object.keys(subcommands).join('|')}]`);
	return subcommands[subcommand](cli, mode);
};
