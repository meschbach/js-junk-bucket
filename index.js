
function main( perform, logger ) {
	perform()
		.then(
			() => {},
			( problem ) => { logger.error( "Error: ", problem) }
		)
}

exports.main = main

