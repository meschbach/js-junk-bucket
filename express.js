/**
 * Adapts the standard ExpressJS calling convention to properly handle promises and properly documenting failure.  This
 * will also attach additional common response codes to the response.
 *
 * @callback future a asyncrhonous function which is either resolves or errors.
 * @return {Function} an Express handler which will properly manage async futures.
 */
function async_handler( future ) {
	return function( req, resp ) {
		standard_responses( resp )
		future( req, resp ).then( () => {
			//Do nothing right now
		}, ( problem ) => {
			console.error( "Encountered async error while handling request", problem )
			server_error( resp )
		})
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
		app.get( path, async_handler(handler))
	};
	router.a_post = function( path, handler ){
		app.post( path, async_handler( handler ) )
	};
	return router
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
	response.conflict = gen( 409 );
	response.forbidden = gen( 500 );
}

module.exports = {
	make_async: express_async,
	responses: standard_responses
};
