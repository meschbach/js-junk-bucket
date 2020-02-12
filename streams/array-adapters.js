/**
 * Adpats streams to and from arrays
 */

const {Readable,Writable} = require("stream");
const assert = require("assert");

/**
 * A readable producing all values of the given array like object.
 */
class ArraySource extends Readable {
	constructor( elements ) {
		super({objectMode:true});
		assert(elements);
		this.elements = elements;
	}

	_read( size ){
		if( this.elements.length === 0 ) {
			this.push(null);
			return;
		}
		let index = 0;
		let willAcceptMore;
		do {
			const el = this.elements[index];
			index++;
			willAcceptMore = this.push(el);
		} while( willAcceptMore && this.elements.length > index);
		this.elements = this.elements.slice(index);
	}
}

/**
 * Captures all values written into an array
 */
class ArrayCapture extends Writable {
	constructor() {
		super({objectMode:true});
		this.elements = [];
	}

	_write(chunk, encoding, callback) {
		this.elements.push(chunk);
		callback();
	}

	_final(cb){
		cb();
	}
}

module.exports = {
	ArraySource,
	ArrayCapture
};
