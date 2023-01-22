'use strict';

const SCHEMA_EXTENSION_REGEX = /.schema/;

const fjs = require('fast-json-stringify');
const schemas = {};

const fjsFuncs = require('require-dir')('./schemas', {
	mapKey(value, filename) {
		return filename.replace(SCHEMA_EXTENSION_REGEX, ''); // extracts pure filename
	},
	mapValue(schema, filename) {
		schemas[filename] = schema; // already modified filename
		return fjs(schema, schemas); // generates FJS function which serializes data upon this schema
	},
});


module.exports = (/* app */) => ({
	schemas,
	fjsFuncs,
	serialize: (schema, data) => {
		try {
			return fjsFuncs[schema](data);
		} catch (e) {
			throw new Error(`Fast Json Stringify - schema "${schema}" doesn't exist`);
		}
	},
});
