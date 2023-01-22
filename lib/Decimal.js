'use strict';

const Big = require('break_infinity.js');


Big.DP = 17;
Big.RM = 2;

Big.prototype.toDP = function toDP(decimalPlaces = 2) {
	const that = this;
	return {
		toNumber() {
			return +that.toFixed(decimalPlaces);
		},
		times(multiplier) {
			return that.mul(multiplier);
		}
	};
};

/*
Big.prototype.dividedBy = function dividedBy(number) {
	return this.div(number);
};

Big.prototype.toNumber = function toNumber() {
	return +this.valueOf();
};

Big.prototype.equals = function equals(number) {
	return this.eq(number);
};

Big.prototype.lessThanOrEqualTo = function lessThanOrEqualTo(number) {
	return (this.cmp(number) !== 1);
};

Big.prototype.greaterThan = function greaterThan(number) {
	return (this.cmp(number) === 1);
};

*/

Big.isDecimal = function isDecimal(value) {
	return value instanceof Big;
};

module.exports = {
	Decimal: Big,
};
