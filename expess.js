
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

function express_async( app ){
	app.a_get = function( path, handler ){
		app.get( path, async_handler(handler))
	}
	app.a_post = function( path, handler ){
		app.post( path, async_handler( handler ) )
	}
	return app
}

function standard_responses( response ) {
	function express_response( status, message ) {
		response.status( status, message )
		response.end()
	}

	function gen( status ) {
		return function( message ) {
			return express_response( status, message )
		}
	}

	response.client_error = gen( 400 )
	response.conflict = gen( 409 )
	response.forbidden = gen( 500 )
}

module.exports = {
	make_async: express_async
	responses: standard_responses
}

