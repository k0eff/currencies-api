'use strict';

const { Transform } = require('stream');

module.exports = class TransformExchange extends Transform {
	constructor({ transformation }) {
		super({ objectMode: true, highWaterMark: 1 });
		this.transformation = transformation;
		this.wrappedPush = this.push.bind(this);
	}

	_transform(o, e, n) {
		this.transformation(o, this.wrappedPush, n);
	}
};
