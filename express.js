const {nope} = require("./index");

/**
 * Adapts the standard ExpressJS calling convention to properly handle promises and properly documenting failure.  This
 * will also attach additional common response codes to the response.
 *
 * @callback future a asyncrhonous function which is either resolves or errors.
 * @return {Function} an Express handler which will properly manage async futures.
 */
function async_handler( future ) {
	return function( req, resp ) {
		standard_responses( resp );

		function log_error( problem ){
			if( resp.headersSent ) {
				console.error("Error occurred after headers sent.  Terminating response", problem );
				resp.end();
			} else {
				console.error("Failed to properly process request", problem );
				resp.server_error("An unexpected condition occurred.");
			}
		}

		try {
			const result = future(req, resp);
			Promise.resolve(result).then(nope, log_error )
		}catch (e) {
			log_error(e);
		}
	}
}

/**
 * Attaches convience methods to an express router to gracefully handle asyncrhonous resource routing
 *
 * @param router the router to be enhanced
 * @return {*} the rotuer
 */
function express_async( router ){
	router.a_get = function( path, handler ){
		router.get( path, async_handler(handler))
	};
	router.a_post = function( path, handler ){
		router.post( path, async_handler( handler ) )
	};
	router.a_put = function( path, handler ){
		router.put( path, async_handler( handler ) )
	};
	router.a_delete = function( path, handler ){
		router.delete( path, async_handler( handler ) )
	};
	return router;
}

/**
 * Attaches convience response methods to the Express response.  Currently this includes 400, 409, and 500.
 *
 * @param response the response object to enhance.
 */
function standard_responses( response ) {
	function express_response( status, message ) {
		response.status( status, message );
		response.end();
	}

	function gen( status ) {
		return function( message ) {
			return express_response( status, message )
		}
	}

	response.client_error = gen( 400 );
	response.unauthorized = gen( 401 );
	response.forbidden = gen( 403 );
	response.notFound = gen( 404 );
	response.conflict = gen( 409 );
	response.server_error = gen( 500 );
}

module.exports = {
	make_async: express_async,
	responses: standard_responses
};
