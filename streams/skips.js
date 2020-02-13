const {Transform} = require("stream");

/**
 * Skips a specific number of elements before continuing the stream.  This transform may be modified after constructions
 * to optional filter out a number of elements.
 */
class SkipCount extends Transform {
	constructor(count) {
		super({});
		this.skip = count;
	}

	_transform(data, encoding, callback){
		if( this.skip <= 0 ){
			this.push(data);
		} else {
			this.skip--;
		}
		callback();
	}
}

/**
 * Skips specific elements within a period.  For example our input stream structure represents a different entity every
 * 9 elements.  Within each entity we are only interested in the 4th and 7th elements.  To accomplish this a PeriodicSkip
 * would be configured with a period of 9, matching [4,9].
 */
class PeriodicSkip extends Transform {
	constructor(period, match, options) {
		super(options);
		this.match = match;
		this.period = period;
		this.index = 0;
	}

	_transform(data, encoding, callback){
		const current = this.index;
		this.index++;
		if( this.index >= this.period ){
			this.index = 0;
		}

		if( this.match.includes(current) ) {
			this.push(data);
		}
		callback();
	}
}

module.exports = {
	SkipCount,
	PeriodicSkip
};
