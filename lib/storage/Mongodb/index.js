'use strict';

const { EventEmitter } = require('events');
const mongodb = require('mongodb');
const moment = require('moment');

const MongoDbWriteStream = require('./streams/MongoDbWriteStream');
const MongoDbBatchUpsertStream = require('./streams/MongoDbBatchUpsertStream');

const buildAggregation = ({
	source = 'ecb', currency, from, to,
}, closest = false) => {
	const agg = [{
		$match: {
			date: closest ? { $lte: from } : { $gte: from, $lte: to },
			source,
			currency,
		},
	},
	{
		$sort: { date: -1 },
	},
	];
	if (closest)
		agg.push({ $limit: 1 });
	agg.push(
		{
			// add baseCurrency as one
			$addFields: {
				[`rates.${currency}`]: { $literal: 1 },
			},
		},
	);
	agg.push(
		{
			$project: {
				_id: 0,
				id: '$_id',
				date: 1,
				currency: 1,
				rates: 1,
			},
		},
	);
	return agg;
};

class MongodbStorage extends EventEmitter {
	constructor({
		uri = 'mongodb://127.0.0.1:27017', // optional
		dbName, // required
		collectionName = 'currencies', // optional
		batchSize = 100, // optional
	} = {}) {
		if (!dbName)
			throw new Error('Where should I store the records, with no dbName provided?! ha?');

		// init EventEmitter class so we'll have the ability to emit evetns
		super();
		// pretty standart mongo adapter settings
		this.client = new mongodb.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		this.client.on('error', e => this.emit('error', e));
		this.client.on('close', () => this.emit('disconnect'));
		this.client.on('disconnect', () => this.emit('disconnect'));

		this.collectionName = collectionName;
		this.dbName = dbName;
		this.batchSize = batchSize;

		this._collection = null;
		this._isConnecting = false;
	}

	// async
	async connect() {
		if (this._isConnected || this._isConnecting)
			return;
		this._isConnecting = true;
		try {
			await this.client.connect();
			this._collection = this.client.db(this.dbName).collection(this.collectionName);
			await this._collection.createIndex({ date: -1, source: 1, currency: 1 });
			this._isConnecting = false;
		} catch (e) {
			this._collection = null;
			this._isConnecting = false;
			throw e;
		}
	}

	findFirst({
		from = moment().format('YYYY-MM-DD'),
		currency,
	}) {
		return this._collection.findOne({
			$query: {
				date: { $lte: from },
				currency,
			},
			$orderby: {
				date: -1,
			},
		});
	}

	findClosestRate({
		from = moment().format('YYYY-MM-DD'),
		currency,
	}) {
		return this._collection.aggregate(buildAggregation({ from, currency }, true));
	}

	findAll({
		from = moment().format('YYYY-MM-DD'),
		to = moment().format('YYYY-MM-DD'),
		currency,
	}) {
		return this._collection.aggregate(buildAggregation({ from, to, currency }, false));
	}

	insertOne(record) {
		return this._collection.insertOne(record);
	}

	stream() {
		return new MongoDbWriteStream(this);
	}

	getBatchStream() {
		return new MongoDbBatchUpsertStream({ storage: this });
	}

	get _isConnected() {
		return !!this._collection;
	}

	async blkWrt(blkData) {
		return this._collection.bulkWrite(blkData);
	}
}

module.exports = MongodbStorage;
