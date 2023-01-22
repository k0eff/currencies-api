'use strict';

const { Decimal } = require('../../lib/Decimal');

const calculateValues = (rates, amount) => Object.entries(rates).reduce((values, [currency, rate]) => {
	values[currency] = amount.times(rate).toDP(2).toNumber();
	return values;
}, {});

class ExchangeRecord {
	constructor({
		_id,
		currency,
		rates,
		source,
		date,
	}, amount = 0, rounding = Decimal.ROUND_UP) {
		this.id = _id;
		this.source = `prefix:${source}:${_id}`;
		this.date = date;
		this.currency = currency;
		this.rates = rates;
		this.amount = amount === 0 ? null : new Decimal(amount).toDP(2, rounding);
		this.values = amount === 0 ? null : calculateValues(rates, this.amount);
		this.amount = amount === 0 ? null : this.amount.toNumber();
	}
}

module.exports = ExchangeRecord;
