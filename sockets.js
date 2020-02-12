const {Future} = require("./future");

/**
 * Abstracts out how to retrieve an address of a socket when being bound as a listener.  The resulting socket is the
 * result of the 'listen' command.  For `net` and `tls` style services this is most the socket itself.  For things like
 * `express` this is the actual HTTP server backing the server.
 *
 * The address is a promise of the address in the format {host, port, family}.
 *
 * `stop` provides a function to terminate the service
 *
 * @param server the socket, http, etc which exposes a "listen" function to bind
 * @param port the port to be bound to (can be 0)
 * @param address the interface to bind to, if null will bind to all
 * @returns {{socket: *, address: Promise<any>, stop: function}}
 */
function addressOnListen( server, port = 0, address ){
	const addressFuture = new Future();

	function done() {
		if(socket){
			socket.close();
		}
	}

	function errorListener( problem ){
		if( !addressFuture.resolved) { addressFuture.reject(problem) }
		done();
	}

	const socket = server.listen( port, address, () => {
		const addr = socket.address();
		const rawHost = addr.address;
		const host = (rawHost == "::") ? "localhost" : rawHost;
		const result = {
			host,
			port: addr.port,
			family: addr.family
		};
		addressFuture.accept(result);
		socket.removeListener("error", errorListener);
	});
	socket.on("error", errorListener);

	return {
		socket,
		address: addressFuture.promised,
		stop: done
	}
}

async function listen(context, server, port, bindToAddress){
	const result = addressOnListen(server, port, bindToAddress);
	result.socket.on("close", function(){
		context.logger.trace("Server socket closed");
	});
	context.onCleanup(async () => {
		context.logger.trace("Cleaning up server",{address});
		//TODO: This should be merged with addressOnListen, making this state management easier
		// const promiseClosed = promiseEvent(result.socket, "close");
		result.stop();
		// await promiseClosed;
	});
	const address = await result.address;
	context.logger.trace("Server bound to",{address});
	return address.host + ":" + address.port;
}

module.exports = {
	addressOnListen,
	listen
};
