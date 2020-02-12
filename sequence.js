/**
 * An abstraction around time bound delayed execution of a series of promises.
 */
const {Future} = require('./future');
const assert = require('assert');

class Sequence {
	constructor( initialValue = true ) {
		const when = new Future();
		when.accept(initialValue);
		this.last_op = when.promised;
	}

	next( perform ){
		assert.equal(typeof perform, "function");
		const operation = this.last_op.then(( input ) => {
			return perform( input )
		});
		this.last_op = operation;
		return operation;
	}

	within_otherwise( timeframe, perform, fail, clock ) {
		let canceled = false;
		let waiting = true;
		const token = clock.notifyIn(timeframe, () =>{
			if( waiting ) {
				canceled = true;
				fail()
			}
		});
		this.next( (input) => {
			if( canceled ){ return input; }
			waiting = false;
			clock.cancel(token);
			return perform( input )
		});
	}
}

module.exports = {
	Sequence
};
