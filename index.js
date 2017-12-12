
//Promise Node Callback
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
