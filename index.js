
/**
 * An adapter from the standard (error, result) NodeJS callback style.
 *
 * @callback perform Accepts a callback to interpret the success/callback of the NodeJS style
 * @returns a promise to be resolved when the callback passed to perform function resolves.
 */
function es6_node( perform ) {
	return new Promise( ( accept, reject ) => {
		try {
			perform( ( error, result ) => { 
				if( error ) {
					reject( error )
				} else {
					accept( result )
				}
			})
		} catch( problem ) {
			reject( problem )
		}
	})
}

/**
 * Wraps the given operation and logs failures of the promise.  This is primarily intended to provide async entry points
 * to avoid having to re-write the this for every command
 *
 * @callback perform An async function to be resolved or logged
 * @param logger Logger to be passed to the performer and target when the application fails
 */
function main( perform, logger = console ) {
	perform( logger )
		.then(
			() => {},
			( problem ) => { logger.error( "Error: ", problem) }
		)
}

/**
 * Does nothing, literally nothing.
 */
function nope() {

}

exports.main = main
exports.es6_node = es6_node
exports.nope = nope
