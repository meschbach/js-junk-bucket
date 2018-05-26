/*
 * Provides facilities for resolution of work in the future
 */

/**
 * A synchronization point for resolving a value at some point in the future through discontinuous flows.  For example,
 * an RPC request to a remote service.
 */
class Future {
	constructor() {
		this.resolved = false
		this.promised = new Promise( (accept, reject) => {
			if( this.resolved ){
				if( this.accept ){
					accept( this.value )
				} else if( this.reject ){
					reject( this.value )
				} else {
					throw new Error("Resolved but neither accepted or rejected.")
				}
				this.value = undefined
			} else {
				this.acceptPromise = accept
				this.rejectPromise = reject
			}
		})
	}

	reject( value ){
		if( this.resolved ){ throw new Error("Already resolved") }

		this.resolved = true

		if( this.rejectPromise ){
			this.rejectPromise( value )

			this._resolve()
		} else {
			this.reject = true
			this.value = value
		}
	}

	accept( value ){
		if( this.resolved ){ throw new Error("Already resolved") }

		this.resolved = true

		if( this.acceptPromise ){
			this.acceptPromise( value )

			this._resolve()
		} else {
			this.accept = true
			this.value = value
		}
	}

	_resolve() {
		this.acceptPromise = undefined
		this.rejectPromise = undefined
	}
}

function delay( forMilliseconds, value ) {
	const future = new Future();
	setTimeout( () => {
		future.accept( value )
	}, forMilliseconds );
	return future.promised;
}

function promiseEvent( from, name ){
	const future = new Future();
	from.once(name, (event) => {
		future.accept(event);
	});
	from.once('error', (why) => {
		future.reject(why);
	});
	return future.promised;
}

async function parallel( promises ){
	const resolutions = promises.map( ( p ) => {
		return p.then( (value) => {
			return {ok:true, value}
		}, (problem) => {
			return {ok:false, problem}
		})
	});
	const results = await Promise.all( resolutions )
	const out = results.reduce( ( output, result ) => {
		if( result.ok ){
			output.good.push(result.value);
		} else {
			output.bad.push(result.problem);
		}
		return output;
	}, { good: [], bad: [] });

	if( out.bad.length > 0 ){
		const error = new Error("Failed to resolves all promises");
		error.good = out.good;
		error.bad = out.bad;
		throw error;
	}
	return out.good;
}

module.exports = Future
module.exports.delay = delay;
module.exports.promiseEvent = promiseEvent;
module.exports.parallel = parallel;
