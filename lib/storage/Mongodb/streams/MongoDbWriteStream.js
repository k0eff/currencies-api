'use strict';

const { Writable } = require('stream');

class MongoDbWriteStream extends Writable {
	/**
	 *
	 * @param {MongodbStorage} collection
	 */
	constructor(storage) {
		super({ objectMode: true, highWaterMark: 1 });
		this.storage = storage;
	}

	_write(obj, _, next) {
		this.storage._collection.updateOne({
			date: obj.date,
			source: obj.source,
			currency: obj.currency,
		},
		{ $set: obj },
		{
			upsert: true,
		}).then(() => next(), e => next(e));
	}
}

module.exports = MongoDbWriteStream;
