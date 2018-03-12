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
	const future = new Future()
	setTimeout( () => {
		future.accept( value )
	}, forMilliseconds )
	return future.promised;
}

module.exports = Future
module.exports.delay = delay
