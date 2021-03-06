const {nope} = require("./index");
const express = require("express");
const {traceErrorSpan} = require("./opentracing");

/**
 * Adapts the standard ExpressJS calling convention to properly handle promises and properly documenting failure.  This
 * will also attach additional common response codes to the response.
 *
 * @callback futureGenerator a asyncrhonous function which is either resolves or errors.
 * @return {Function} an Express handler which will properly manage async futures.
 */
function async_handler( futureGenerator, logger ) {
	return function( req, resp ) {
		standard_responses( resp );

		function log_error( problem ){
			if( resp.headersSent ) {
				logger.error("Error occurred after headers sent.  Terminating response", problem );
				resp.end();
			} else {
				const span = ((req.context || {}).opentracing || {}).span;
				if( span ) {
					traceErrorSpan(span, problem);
				}
				logger.error("Failed to properly process request", problem );
				resp.server_error("An unexpected condition occurred.");
			}
		}

		try {
			const result = futureGenerator(req, resp);
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
 * @param logger to use if the request is missing a context
 * @return {*} the router
 */
function express_async( router, logger = console ){
	router.a_get = function( path, handler ){
		router.get( path, async_handler(handler, logger))
	};
	router.a_post = function( path, handler ){
		router.post( path, async_handler( handler, logger ) )
	};
	router.a_put = function( path, handler ){
		router.put( path, async_handler( handler, logger ) )
	};
	router.a_delete = function( path, handler ){
		router.delete( path, async_handler( handler, logger ) )
	};
	router.a_all = function( path, handler ){
		router.all( path, async_handler( handler, logger ) );
	};
	return router;
}

function asyncRouter( logger = console, options ){
	const router = new express.Router( options );
	return express_async(router, logger);
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
	responses: standard_responses,
	asyncRouter
};
