'use strict';

const { Writable } = require('stream');

class MongoDbBatchUpsertStream extends Writable {
	constructor({ settings, storage }) {
		settings = settings || [];
		super({ ...settings, highWaterMark: 1, objectMode: true });
		this.storage = storage;
		this.buffer = [];
		this.maxBuffer = 10000;
		this.flushCounter = 0;
	}

	async _write(data, _, next) {
		const nextData = this.prepData(data);
		this.buffer.push(nextData);
		if (this.buffer.length < this.maxBuffer) return next();
		await this.flushBuffer();
		this.flushCounter++;
		return next();
	}

	async _final(done) {
		await this.flushBuffer();
		done();
	}


	async flushBuffer() {
		await this.storage.blkWrt(this.buffer);
		this.buffer=[];
		this.flushCounter++;
	}

	prepData(data) {
		const {date, source, currency} = data;
		return {
			updateOne: {
				filter: { date, source, currency },
				update: { $set: data },
				upsert: true,
			}
		}
	}

};

module.exports = MongoDbBatchUpsertStream;
