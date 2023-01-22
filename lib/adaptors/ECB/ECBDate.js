'use strict';

const moment = require('moment');
const { Decimal } = require('../../Decimal');

const Transfrom = require('./streams/Transform');

const BASE_CURRENCY = 'EUR';
const SOURCE = 'ecb';

const truthy = () => true;
const currencyToDecimal = (val) => {
	const numericVal = parseFloat(val.trim());
	if (Number.isNaN(numericVal)) // NaN
		return null;
	try {
		return new Decimal(numericVal);
	} catch (e) {
		console.error(numericVal, e);
		return null;
	}
};
const currenciesArrayToFilterObject = (array, value = true) => array.reduce((obj, cur) => {
	obj[cur] = value;
	return obj;
}, {});


class ECBDate {
	constructor({
		Date: recordDate,
		...rates
	}, {
		isCurrencySupported = ECBDate.all,
	} = {}) {
		this.date = moment(new Date(recordDate)).format('YYYY-MM-DD'); // new Date(recordDate);
		this.supportedCurrencies = [];
		this.isCurrencySupported = isCurrencySupported;
		Object.entries(rates).forEach(rate => this._prepareRate(rate));
		this._prepareRate([BASE_CURRENCY, '1']);
	}

	_prepareRate([cur, rate]) {
		cur = cur.trim();

		if (!this.isCurrencySupported(cur) || cur in this)
			return;

		this[cur] = currencyToDecimal(rate.trim());
		this.supportedCurrencies.push(cur);
	}

	calculateRates(callback = () => { }) {
		this.supportedCurrencies.forEach((r) => {
			const rates = this.calculateRate(r);

			if (rates)
				callback(rates);
		});
	}

	calculateRate(rate) {
		// rates without data for the current date
		if (!this[rate])
			return null;

		const thisRate = this[rate];
		const result = {
			date: this.date,
			base_curency: BASE_CURRENCY,
			source: SOURCE,
			currency: rate,
			rates: {},
		};

		this.supportedCurrencies.forEach((cur) => {
			// no data for the current date ( this.date )
			if (cur === rate || !this[cur])
				return;

			result.rates[cur] = this[cur].dividedBy(thisRate).toDP(4).toNumber();
		});
		return result;
	}

	static stream({
		process: isCurrencySupported = truthy,
	} = {}) {
		return new Transfrom({
			transformation: (row, push, next) => {
				const data = new ECBDate(row, { isCurrencySupported });

				next(null, data);
			},
		});
	}

	static only(currencies = []) {
		const currenciesObject = currenciesArrayToFilterObject(currencies, true);

		return cur => currenciesObject[cur];
	}

	static not(currencies = []) {
		const currenciesObject = currenciesArrayToFilterObject(currencies, false);

		return cur => currenciesObject[cur] !== false;
	}

	static all() {
		return truthy;
	}
}

module.exports = ECBDate;
