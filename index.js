
function main( perform, name ) {
	perform()
		.then(
			() => {},
			( problem ) => {}
		)
}

exports.main = main

